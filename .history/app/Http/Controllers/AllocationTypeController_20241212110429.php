<?php

namespace App\Http\Controllers;

use App\Models\AllocationType;
use App\Models\AllocationTypeBarangay;
use App\Models\AllocationTypeCommodity;
use App\Models\AllocationTypeCropDamageCause;
use App\Models\AllocationTypeElligibility;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AllocationTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {

        $allocationTypes = AllocationType::with([
            'barangays',
            'commodities',
            'cropDamageCauses',
            'elligibilities'
        ])->get();

        $output = $allocationTypes->map(function ($allocationType) {
            return [
                'id' => $allocationType->id,
                'name' => $allocationType->name,
                'desc' => $allocationType->desc,
                'barangays' => $allocationType->barangays->map(function ($barangay) {
                    return [
                        'id' => $barangay->id,
                        'name' => $barangay->name
                    ];
                }),
                'commodities' => $allocationType->commodities->map(function ($commodity) {
                    return [
                        'id' => $commodity->id,
                        'name' => $commodity->name
                    ];
                }),
                'crop_damage_causes' => $allocationType->cropDamageCauses->map(function ($cropDamages) {
                    return [
                        'id' => $cropDamages->id,
                        'name' => $cropDamages->name
                    ];
                }),
                'elligibilities' => $allocationType->elligibilities->map(function ($elligibility) {
                    return [
                        'id' => $elligibility->id,
                        'eligibility_type' => $elligibility->elligibility_type
                    ];
                })
            ];
        });

        return Inertia::render("Super Admin/List/Allocation_Type/Allocation_type_list", [
            'allocationTypes' => $output
        ]);
    }


    public function show() {

        $allocationTypes = AllocationType::with([
            'barangays',
            'commodities',
            'cropDamageCauses',
            'elligibilities'
        ])->get();

        // Transform the data to match the desired structure
        $output = $allocationTypes->map(function ($allocationType) {
            return [
                'id' => $allocationType->id,
                'name' => $allocationType->name,
                'desc' => $allocationType->desc,
                'barangays' => $allocationType->barangays->map(function ($barangay) {
                    return [
                        'id' => $barangay->id,
                        'name' => $barangay->name
                    ];
                }),
                'commodities' => $allocationType->commodities->map(function ($commodity) {
                    return [
                        'id' => $commodity->id,
                        'name' => $commodity->name
                    ];
                }),
                'crop_damage_causes' => $allocationType->cropDamageCauses->map(function ($cropDamageCause) {
                    return [
                        'id' => $cropDamageCause->id,
                        'name' => $cropDamageCause->name
                    ];
                }),
                'elligibilities' => $allocationType->elligibilities->map(function ($eligibility) {
                    return [
                        'id' => $eligibility->id,
                        'eligibility_type' => $eligibility->eligibility_type
                    ];
                })
            ];
        });

        return response()->json($allocationTypes);
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
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'desc' => 'nullable|string',
            'barangays' => 'array',
            'commodities' => 'array',
            'crop_damage_causes' => 'array',
            'eligibilities' => 'array',
        ]);

        $allocationType = AllocationType::create([
            'name' => $validated['name'],
            'desc' => $validated['desc'],
        ]);

        // Save related data
        if (!empty($validated['barangays'])) {
            foreach ($validated['barangays'] as $barangayId) {
                AllocationTypeBarangay::create([
                    'allocation_type_id' => $allocationType->id,
                    'barangay_id' => $barangayId,
                ]);
            }
        }

        if (!empty($validated['commodities'])) {
            foreach ($validated['commodities'] as $commodityId) {
                AllocationTypeCommodity::create([
                    'allocation_type_id' => $allocationType->id,
                    'commodity_id' => $commodityId,
                ]);
            }
        }

        if (!empty($validated['crop_damage_causes'])) {
            foreach ($validated['crop_damage_causes'] as $damageCauseId) {
                AllocationTypeCropDamageCause::create([
                    'allocation_type_id' => $allocationType->id,
                    'crop_damage_cause_id' => $damageCauseId,
                ]);
            }
        }

        if (!empty($validated['eligibilities'])) {
            foreach ($validated['eligibilities'] as $eligibilityId) {
                AllocationTypeElligibility::create([
                    'allocation_type_id' => $allocationType->id,
                    'elligibility_id' => $eligibilityId,
                ]);
            }
        }

        return response()->json(['message' => 'Allocation type saved successfully']);
    }




    /**
     * Show the form for editing the specified resource.
     */
    public function edit(AllocationType $allocationType)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, AllocationType $allocationType)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AllocationType $allocationType)
    {
        //
    }
}
