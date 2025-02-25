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
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;


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

        public function admin()
        {

            $damage = CropDamage::with(['farmer', 'commodity', 'barangay'])->get();
            $barangay = Barangay::all();
            $farmer = Farmer::all();
            $commodity = Commodity::all();
            return Inertia::render("Admin/List/Crop_Damages/CropDamagesList", [
                'damage' => $damage,
                'barangays' => $barangay,
                'farmers' => $farmer,
                'commodities' => $commodity
            ]);
        }

        public function showCropDamages(){
           $damage = CropDamage::with(['farmer', 'commodity', 'barangay', 'cropDamageCause', 'farm'])->get();

            foreach ($damage as $item) {
                if ($item->farm === null) {
                    logger()->error("Missing farm for CropDamage ID: {$item->id}, farm_id: {$item->farm_id}");
                }
            }

            return response()->json($damage);

        }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }


public function store(Request $request)
{
    try {
        Log::info('Request data:', $request->all());

        $validator = Validator::make($request->all(), [
            'proof' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:2048',
            'farmer_id' => 'required|exists:farmers,id',
            'farm_id' => 'required|exists:farms,id',
            'crop_damage_cause_id' => 'required|exists:crop_damage_causes,id',
            'commodity_id' => 'required|exists:commodities,id',
            'brgy_id' => 'required|exists:barangays,id',
            'total_damaged_area' => 'required|numeric|min:0',
            'partially_damaged_area' => 'nullable|numeric|min:0',
            'area_affected' => 'required|numeric|min:0',
            'severity' => 'nullable|string|max:255',
            'remarks' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $proofPath = null;
        if ($request->hasFile('proof')) {
            $file = $request->file('proof');
            $fileName = time() . '.' . $file->getClientOriginalExtension();
            $file->storeAs('public/proof', $fileName);
            $proofPath = '/storage/proof/' . $fileName;
        }

        Log::info('Proof Path:', ['path' => $proofPath]);

        // Insert the record using raw SQL
        DB::insert(
            'INSERT INTO crop_damages
            (farmer_id, farm_id, commodity_id, brgy_id, total_damaged_area, partially_damaged_area, crop_damage_cause_id, area_affected, severity, remarks, proof, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                $request->farmer_id,
                $request->farm_id,
                $request->commodity_id,
                $request->brgy_id,
                $request->total_damaged_area,
                $request->partially_damaged_area,
                $request->crop_damage_cause_id,
                $request->area_affected,
                $request->severity,
                $request->remarks,
                $proofPath,
                now(),
                now(),
            ]
        );

        return response()->json(['message' => 'Crop damage stored successfully'], 200);
    } catch (\Exception $e) {
        Log::error('Error:', ['exception' => $e->getMessage()]);
        return response()->json([
            'message' => 'An error occurred',
            'error' => $e->getMessage(),
        ], 500);
    }
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
    $cropDamage = CropDamage::find($id);
    if (!$cropDamage) {
        return response()->json([
            'message' => 'Crop damage not found'
        ], 404);
    }

    $validator = Validator::make($request->all(), [
        'farmer_id' => 'required|exists:farmers,id',
        'commodity_id' => 'required|exists:commodities,id',
        'brgy_id' => 'required|exists:barangays,id',
        'total_damaged_area' => 'required|numeric|min:0',
        'partially_damaged_area' => 'nullable|numeric|min:0',
        'area_affected' => 'required|numeric|min:0',
        'remarks' => 'nullable|string|max:255',
        'severity' => 'required|string|in:high,medium,low',
        'proof' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'message' => 'Validation failed',
            'errors' => $validator->errors()
        ], 422);
    }

    // Handle file upload properly
    if ($request->hasFile('proof')) {
        $file = $request->file('proof');
        $fileName = time() . '.' . $file->getClientOriginalExtension();

        // Store the file in storage/app/public/proof
        $file->storeAs('public/proof', $fileName);

        // Set the correct file path for accessing via /storage/proof/
        $cropDamage->proof = '/storage/proof/' . $fileName;
    }

    // Update other fields
    $cropDamage->farmer_id = $request->farmer_id;
    $cropDamage->commodity_id = $request->commodity_id;
    $cropDamage->brgy_id = $request->brgy_id;
    $cropDamage->total_damaged_area = $request->total_damaged_area;
    $cropDamage->partially_damaged_area = $request->partially_damaged_area;
    $cropDamage->area_affected = $request->area_affected;
    $cropDamage->remarks = $request->remarks;
    $cropDamage->severity = $request->severity;

    $cropDamage->save(); // Save updated record

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
