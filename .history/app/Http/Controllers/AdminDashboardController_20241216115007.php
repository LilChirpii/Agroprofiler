<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    public function index() {
        $barangays = Barangay::all();
        $allocations = Allocation::all();
        $allocationType = AllocationType::all();
        $commodityCategories = CommodityCategory::with('commodities')->get();
        $registeredFarmers = Farmer::where('status', 'registered')->count();
        $unregisteredFarmers = Farmer::where('status', 'unregistered')->count();
        $totalFarmers = Farmer::count();
        $heatmapData = [];

        foreach ($barangays as $barangay) {
            $barangayFarms = Farm::with('farmer')->where('brgy_id', $barangay->id)->get();
            $registeredFarmersInBarangay = $barangayFarms->filter(fn($farm) => $farm->farmer->status === 'registered')->count();
            $unregisteredFarmersInBarangay = $barangayFarms->filter(fn($farm) => $farm->farmer->status === 'unregistered')->count();

            $heatmapData[$barangay->name] = [
                'allocations' => [],
                'commodities_categories' => [],
                'farmers' => [
                    'Registered' => $registeredFarmersInBarangay,
                    'Unregistered' => $unregisteredFarmersInBarangay,
                ],
                'commodities' => [],
            ];

            foreach ($allocationType as $type) {
                $count = $allocations->where('allocation_type_id', $type->id)->where('brgy_id', $barangay->id)->count();
                $heatmapData[$barangay->name]['allocations'][$type->name] = $count;
            }

           foreach ($commodityCategories as $category) {
                $categoryCommodities = [];

                foreach ($category->commodities as $commodity) {
                    $count = $barangayFarms->filter(function ($farm) use ($commodity) {
                        return $farm->commodity_id === $commodity->id;
                    })->count();

                    $categoryCommodities[$commodity->name] = $count;
                }

                $heatmapData[$barangay->name]['commodities_categories'][$category->name] = $categoryCommodities;
            }
        }

        return Inertia::render('Super Admin/Dashboard', [
            'totalAllocations' => $allocations->count(),
            'allocationType' => $allocationType,
            'registeredFarmers' => $registeredFarmers,
            'unregisteredFarmers' => $unregisteredFarmers,
            'totalFarmers' => $totalFarmers,
            'heatmapData' => $heatmapData,
            'commodityCategories' => $commodityCategories,
        ]);
    }
}
