<?php

namespace App\Http\Controllers;

use App\Models\Allocation;
use App\Models\AllocationType;
use App\Models\Barangay;
use App\Models\Commodity;
use App\Models\CommodityCategory;
use App\Models\Farmer;
use App\Models\Farm;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function showAdmin(){
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
            ];

            // Get allocations for each barangay
            foreach ($allocationType as $type) {
                $count = $allocations->where('allocation_type_id', $type->id)->where('brgy_id', $barangay->id)->count();
                $heatmapData[$barangay->name]['allocations'][$type->name] = $count;
            }

            // Loop through each commodity category and its commodities
            foreach ($commodityCategories as $category) {
                $categoryCommodities = [];
                $categoryTotalCount = 0;

                // For each commodity in the category, get the count for this barangay
                foreach ($category->commodities as $commodity) {
                    $count = $barangayFarms->filter(function ($farm) use ($commodity) {
                        return $farm->commodity_id === $commodity->id;
                    })->count();

                    $categoryCommodities[] = [
                        'name' => $commodity->name,
                        'count' => $count,
                    ];

                    $categoryTotalCount += $count;  // Sum up the total count for the category
                }

                // Add the commodity category and its total to the barangay's data
                $heatmapData[$barangay->name]['commodities_categories'][] = [
                    'commodity_category_name' => $category->name,
                    'commodity_category_total' => $categoryTotalCount,
                ];

                // Add the commodities under the category to the barangay's data
                $heatmapData[$barangay->name]['commodities'][] = [
                    'commodities_category_name' => $category->name,
                    'commodities' => $categoryCommodities,
                ];
            }
        }

        return Inertia::render('Admin/AdminDashboard',[
            'totalAllocations' => $allocations->count(),
            'allocationType' => $allocationType,
            'registeredFarmers' => $registeredFarmers,
            'unregisteredFarmers' => $unregisteredFarmers,
            'totalFarmers' => $totalFarmers,
            'heatmapData' => $heatmapData,
        ]);

    }

    public function showResponseDashboard()
    {
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
            'commodities' => [], // Make sure this is here to hold commodity data
        ];

        // Get allocations for each barangay
        foreach ($allocationType as $type) {
            $count = $allocations->where('allocation_type_id', $type->id)->where('brgy_id', $barangay->id)->count();
            $heatmapData[$barangay->name]['allocations'][$type->name] = $count;
        }

        // Loop through each commodity category and sum up their totals
        foreach ($commodityCategories as $category) {
            $categoryTotalCount = 0;
            $categoryCommodities = [];

            // For each commodity in the category, get the count for this barangay
            foreach ($category->commodities as $commodity) {
                $count = $barangayFarms->filter(function ($farm) use ($commodity) {
                    return $farm->commodity_id === $commodity->id;
                })->count();

                // Track the commodity and its count
                $categoryCommodities[] = [
                    'name' => $commodity->name,
                    'count' => $count,
                ];

                // Sum up the total count for the category
                $categoryTotalCount += $count;
            }

            // Add the commodity category and its total count to the barangay's data
            $heatmapData[$barangay->name]['commodities_categories'][$category->name] = $categoryTotalCount;

            // Include the individual commodities under the category
            $heatmapData[$barangay->name]['commodities'][] = [
                'commodities_category_name' => $category->name,
                'commodities' => $categoryCommodities,
            ];
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
            ];

            // Get allocations for each barangay
            foreach ($allocationType as $type) {
                $count = $allocations->where('allocation_type_id', $type->id)->where('brgy_id', $barangay->id)->count();
                $heatmapData[$barangay->name]['allocations'][$type->name] = $count;
            }

            // Loop through each commodity category and sum up their totals
            foreach ($commodityCategories as $category) {
                $categoryTotalCount = 0;
                $categoryCommodities = [];

                // For each commodity in the category, get the count for this barangay
                foreach ($category->commodities as $commodity) {
                    $count = $barangayFarms->filter(function ($farm) use ($commodity) {
                        return $farm->commodity_id === $commodity->id;
                    })->count();

                    // Track the commodity and its count
                    $categoryCommodities[] = [
                        'name' => $commodity->name,
                        'count' => $count,
                    ];

                    // Sum up the total count for the category
                    $categoryTotalCount += $count;
                }

                // Add the commodity category and its total count to the barangay's data
                $heatmapData[$barangay->name]['commodities_categories'][$category->name] = $categoryTotalCount;

                // Include the individual commodities under the category
                $heatmapData[$barangay->name]['commodities'][] = [
                    'commodities_category_name' => $category->name,
                    'commodities' => $categoryCommodities,
                ];
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


      public function allocationTypes()
        {
            $allocationCounts = Allocation::select('allocation_type_id', DB::raw('count(*) as count'))
                ->groupBy('allocation_type_id')
                ->get();

            // Map the data to include the allocation type name and count
            $data = $allocationCounts->map(function ($allocation) {
                return [
                    'name' => AllocationType::find($allocation->allocation_type_id)->name,
                    'value' => $allocation->count,
                ];
            });

            return response()->json($data);
        }

    public function getAllocationTypeCounts()
    {
        $allocationCounts = Allocation::select('allocation_type_id', DB::raw('count(*) as count'))
            ->groupBy('allocation_type_id')
            ->get();

        // Map the data to include the allocation type name and count
        $data = $allocationCounts->map(function ($allocation) {
            return [
                'name' => AllocationType::find($allocation->allocation_type_id)->name,
                'value' => $allocation->count,
            ];
        });

        return response()->json($data);
    }

    public function commodityCategoryCounts()
    {
         $categories = CommodityCategory::with(['commodities.farms'])->get();

        $result = $categories->map(function ($category) {
            $commodities = $category->commodities->map(function ($commodity) {
                return [
                    'commodity_name' => $commodity->name,
                    'commodity_total' => $commodity->farms->count(),
                ];
            });

            return [
                'commodity_category_name' => $category->name,
                'commodity_category_total' => $commodities->sum('commodity_total'),
                'commodities' => $commodities,
            ];
        });

        return response()->json($result);

    }

    public function commodityCounts()
    {
         $categories = CommodityCategory::with(['commodities.farms'])->get();

        $result = $categories->map(function ($category) {
            $commodities = $category->commodities->map(function ($commodity) {
                return [
                    'commodity_name' => $commodity->name,
                    'commodity_total' => $commodity->farms->count(),
                ];
            });

            return [
                'commodity_category_name' => $category->name,
                'commodity_category_total' => $commodities->sum('commodity_total'),
                'commodities' => $commodities,
            ];
        });

        return response()->json($result);
    }

    public function farmerCounts()
    {
        $registeredFarmers = Farmer::where('status', 'registered')->count();
        $unregisteredFarmers = Farmer::where('status', 'unregistered')->count();

        return response()->json([$unregisteredFarmers, $registeredFarmers]);
    }

    public function show(){
        // $year = input->('year');
        $barangays = Barangay::all();
        $allocations = Allocation::all();
        $allocationType = AllocationType::all();
        $commodityCategories = CommodityCategory::with('commodities')->get();
        $registeredFarmers = Farmer::where('status', 'registered')->count();
        $unregisteredFarmers = Farmer::where('status', 'unregistered')->count();
        $totalFarmers = Farmer::count();
        $allocationTypeCounts = Allocation::with('')->get();
        $heatmapData = [];
        $commodityCounts = [];
        $commodityCategoryCounts = [];

        // $allocationCounts = AllocationType::withCount(['allocations' => function ($query) use ($year)
        // { if ($year) { $query->whereYear('created_at', $year); } }])->get();

        // $response = [];
        // foreach ($allocationCounts as $type) {
        //     $response[$type->name] = $type->allocations_count;
        //     return response()->json($response[$type->name]);
        // }

        foreach ($barangays as $barangay) {
            $barangayFarms = Farm::with('farmer')->where('brgy_id', $barangay->id)->get();
            $registeredFarmersInBarangay = $barangayFarms->filter(fn($farm) => $farm->farmer->status === 'registered')->count();
            $unregisteredFarmersInBarangay = $barangayFarms->filter(fn($farm) => $farm->farmer->status === 'unregistered')->count();

            $heatmapData[$barangay->name] = [
                'allocations' => [],
                'commodities' => [],
                'farmers' => [
                    'Registered' => $registeredFarmersInBarangay,
                    'Unregistered' => $unregisteredFarmersInBarangay,
                ],
            ];

            foreach ($allocationType as $type) {
                $count = $allocations->where('allocation_type_id', $type->id)->where('brgy_id', $barangay->id)->count();
                $heatmapData[$barangay->name]['allocations'][$type->name] = $count;
            }

            foreach ($commodityCategories as $category) {

                if (!isset($commodityCounts[$category->name])) {
                    $commodityCounts[$category->name] = [];
                }

                $categoryCommodities = [];
                foreach ($category->commodities as $commodity) {

                    $count = $barangayFarms->filter(function ($farm) use ($commodity) {
                        return $farm->commodity_id === $commodity->id;
                    })->count();

                    $categoryCommodities[] = [
                        'name' => $commodity->name,
                        'count' => $count,
                    ];

                    $heatmapData[$barangay->name]['commodities'][$category->name] = $categoryCommodities;
                    $commodityCounts[$category->name] = $categoryCommodities;
                }
            }

        }

        return response()->json($allocationType);
    }


    public function getCounts(Request $request){
        $year = $request->input('year');

    }

    public function getFarmersDistribution(Request $request)
    {

        $year = $request->input('year');
        $category = $request->input('subcategory', 'all');


        $data = Barangay::withCount([
            'farmers as registered_count' => function ($query) use ($year) {
                $query->where('status', 'registered')
                    ->when($year && $year !== 'all', function ($query) use ($year) {

                        $query->whereYear('registration_date', $year);
                    });
            },
            'farmers as unregistered_count' => function ($query) use ($year) {
                $query->where('status', 'unregistered')
                    ->when($year && $year !== 'all', function ($query) use ($year) {

                        $query->whereYear('registration_date', $year);
                    });
            }
        ])
        ->get()
        ->map(function ($barangay) use ($category) {

            $registeredCount = $barangay->registered_count;
            $unregisteredCount = $barangay->unregistered_count;


            if ($category === 'registered') {
                return [
                    'barangay' => $barangay->name,
                    'value' => [$registeredCount],
                ];
            }

            if ($category === 'unregistered') {
                return [
                    'barangay' => $barangay->name,
                    'value' => [$unregisteredCount],
                ];
            }


            return [
                'barangay' => $barangay->name,
                'value' => [$registeredCount, $unregisteredCount],
            ];
        });

        return response()->json($data);
    }

    public function getAllocationsDistribution(Request $request)
    {
        $year = $request->input('year');
        $category = $request->input('subcategory', 'all');
        $data = Barangay::with(['allocations' => function($query) use ($year, $category) {
            $query->when($category && $category !== 'all', function ($query) use ($category) {
                $query->where('allocation_type_id', $category); // Filter by allocation type
            })
            ->when($year && $year !== 'all', function ($query) use ($year) {
                $query->whereYear('allocations.date_received', $year); // Filter by year
            })
            ->with('allocationType')
            ->selectRaw('brgy_id, allocation_type_id, COUNT(*) as allocation_count')
            ->groupBy('brgy_id', 'allocation_type_id');
        }])
        ->get()
        ->map(function ($barangay) {
            return [
                'barangay' => $barangay->name,
                'allocations' => $barangay->allocations->map(function ($allocation) {
                    return [
                        'allocation_type' => $allocation->allocationType->name,
                        'allocation_count' => $allocation->allocation_count,
                    ];
                }),
            ];
        });
        return response()->json($data);
    }
    protected function getFarmerGroup(Farmer $farmer)
    {

        if ($farmer->is_registered) {
            if ($farmer->age >= 60) {
                return 'seniorCitizen';
            }
            return 'registered';
        }

        if ($farmer->is_pwd) {
            return 'pwd';
        }

        return 'unregistered';
    }
    public function getStackedData()
    {
        return response()->json([
            [
                'category' => 'Category 1',
                'subcategories' => [
                    'Sub1' => 10,
                    'Sub2' => 20,
                    'Sub3' => 30,
                ],
            ],
            [
                'category' => 'Category 2',
                'subcategories' => [
                    'Sub1' => 15,
                    'Sub2' => 25,
                    'Sub3' => 35,
                ],
            ],
        ]);
    }



}
