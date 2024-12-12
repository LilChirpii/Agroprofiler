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
            'proof' => 'nullable|string|max:255',
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

        CropDamage::create($request->all());

        // return redirect()->route('crop.damages.index')->with('success', 'Crop damage record created successfully.');
        // return response()->json(['message' => 'Crop damage data stored successfully.']);
        //  return redirect()->route('cropdamages.index');
        // return Redirect::route('crop.damages.index');
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
    public function update(Request $request, CropDamage $id)
    {
        $cropDamage = CropDamage::findOrFail($id);
        // Validate incoming request
        $validator = Validator::make($request->all(), [
            'farmer_id' => 'required|exists:farmers,id',
            'commodity_id' => 'required|exists:commodities,id',
            'brgy_id' => 'required|exists:barangays,id',
            'total_damaged_area' => 'required|numeric|min:0',
            'partially_damaged_area' => 'nullable|numeric|min:0',
            'area_affected' => 'required|numeric|min:0',
            'cause' => 'required|string|max:255',
            'remarks' => 'nullable|string|max:255',
            'proof' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048', // Optional validation for image file
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        // Handle the file upload
        if ($request->hasFile('proof')) {
            // Get the file from the request
            $file = $request->file('proof');

            // Generate a unique name for the file
            $fileName = time() . '.' . $file->getClientOriginalExtension();

            // Store the file in the public/proof directory
            $file->move(public_path('proof'), $fileName);

            // Delete the old proof file if it exists (optional)
            if ($id->proof && file_exists(public_path($id->proof))) {
                unlink(public_path($id->proof)); // Remove the old proof file
            }

            // Save the new file path to the database (in the proof column)
            $request->merge(['proof' => 'proof/' . $fileName]);
        } else {
            // If no new proof is uploaded, retain the existing proof in the database
            $request->merge(['proof' => $id->proof]);
        }

        // Update the crop damage record with validated data and the file path (if uploaded)
        $id->update($request->all());

        // Return a response with the updated data
        return response([
            'message' => 'Crop damage data updated successfully',
            'data' => $id
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
