<?php

namespace App\Http\Controllers;

use App\Http\Requests\CropDamagesRequest;
use App\Models\Barangay;
use App\Models\Commodity;
use App\Models\CropDamage;
use App\Models\CropDamages;
use App\Models\Farmer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;

class CropDamagesController extends Controller
{

    public function index()
        {

            $damage = CropDamage::with(['farmer', 'commodity', 'barangay'])->get();

            $barangay = Barangay::all();
            $farmer = Farmer::all();
            $commodity = Commodity::all();
            return Inertia::render("Super Admin/List/Crop_Damages/CropDamagesList", [
                'damage' => $damage,
                'barangays' => $barangay,
                'farmers' => $farmer,
                'commodities' => $commodity
            ]);
        }

        public function showCropDamages(){
            $damage = CropDamage::with(['farmer', 'commodity', 'barangay', 'cropDamageCause'])->get();
            return response()->json($damage);
        }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'proof' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:2048', // Ensure file validation
            'farmer_id' => 'required|exists:farmers,id',
            'commodity_id' => 'required|exists:commodities,id',
            'brgy_id' => 'required|exists:barangays,id',
            'total_damaged_area' => 'required|numeric|min:0',
            'partially_damaged_area' => 'nullable|numeric|min:0',
            'area_affected' => 'required|numeric|min:0',
            'cause' => 'required|string|max:255',
            'remarks' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        // Handle file upload
        $proofPath = null;
        if ($request->hasFile('proof')) {
            $proofPath = $request->file('proof')->store('proof', 'public'); // Store in public/proof
        }

        // Create a new crop damage entry
        CropDamage::create([
            'farmer_id' => $request->farmer_id,
            'commodity_id' => $request->commodity_id,
            'brgy_id' => $request->brgy_id,
            'total_damaged_area' => $request->total_damaged_area,
            'partially_damaged_area' => $request->partially_damaged_area,
            'area_affected' => $request->area_affected,
            'cause' => $request->cause,
            'remarks' => $request->remarks,
            'severity' => $request->severity,
            'proof' => $proofPath, // Save the file path to the database
        ]);

        return response()->json(['message' => 'Crop damage stored successfully'], 200);

    }



    /**
     * Display the specified resource.
     */
    public function show(CropDamage $cropDamage)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(CropDamage $cropDamage)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
   /**
 * Update the specified resource in storage.
 */
   /**
 * Update the specified resource in storage.
 */
  public function update(Request $request, $id)
{
    // Find the CropDamage record by ID
    $cropDamage = CropDamage::find($id);
    if (!$cropDamage) {
        return response()->json([
            'message' => 'Crop damage not found'
        ], 404);
    }

    // Validate incoming data
    $validator = Validator::make($request->all(), [
        'farmer_id' => 'required|exists:farmers,id',
        'commodity_id' => 'required|exists:commodities,id',
        'brgy_id' => 'required|exists:barangays,id',
        'total_damaged_area' => 'required|numeric|min:0',
        'partially_damaged_area' => 'nullable|numeric|min:0',
        'area_affected' => 'required|numeric|min:0',
        'remarks' => 'nullable|string|max:255',
        'severity' => 'required|string|in:high,medium,low', // Add valid values for severity
        'proof' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048', // Image validation
    ]);

    // Check if validation fails
    if ($validator->fails()) {
        return response()->json([
            'message' => 'Validation failed',
            'errors' => $validator->errors()
        ], 422); // Return detailed validation errors
    }

    // Handle file upload if proof is provided
    if ($request->hasFile('proof')) {
        $file = $request->file('proof');
        $fileName = time() . '.' . $file->getClientOriginalExtension();
        $file->move(public_path('proof'), $fileName);
        $request->merge(['proof' => 'proof/' . $fileName]);
    }

    // Update the crop damage record
    $cropDamage->update($request->all());

    return response()->json([
        'message' => 'Crop damage record updated successfully',
        'data' => $cropDamage
    ], 200);
}



    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $damage = CropDamage::find($id);
        if ($damage) {
            $damage->delete();
            return redirect()->route('crop.damages.index')->with('success', 'damage updated successfully');
        }
        return response()->json(['message' => 'damage not found'], 404);
    }
}
