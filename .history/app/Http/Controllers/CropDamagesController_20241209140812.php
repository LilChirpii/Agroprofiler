<?php

namespace App\Http\Controllers;

use App\Models\Barangay;
use App\Models\Commodity;
use App\Models\CropDamage;
use App\Models\CropDamages;
use App\Models\Farmer;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;

class CropDamagesController extends Controller
{

    public function index()
        {

            $damage = CropDamage::with(['farmer', 'commodity', 'barangay'])->paginate(20);

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
            $damage = CropDamage::with(['farmer', 'commodity', 'barangay'])->get();
            return response($damage);
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
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        // Create new crop damage record
        CropDamage::create($request->all());

        return redirect()->route('crop.damages.index')->with('success', 'Crop damage record created successfully.');
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
    public function update(Request $request, CropDamage $cropDamage)
    {
        //
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
