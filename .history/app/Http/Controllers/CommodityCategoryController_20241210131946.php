<?php

namespace App\Http\Controllers;

use App\Models\CommodityCategory;
use App\Models\rc;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CommodityCategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(CommodityCategory::all());
    }

    public function show()
    {
        $commodity = CommodityCategory::all();

        return Inertia::render("Super Admin/List/Commodities/Commodities", [
            'commodity' => $commodity,
        ]);
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
        $request->validate([
            'name' => 'required|string|max:255',
            'desc' => 'required|string|max:255',
        ]);

        CommodityCategory::create($request->all());

        return response()->json(['message' => 'Commodity added successfully']);
    }

    /**
     * Display the specified resource.
     */
    // public function show(rc $rc)
    // {
    //     //
    // }

    /**
     * Show the form for editing the specified resource.
     */
    // public function edit(rc $rc)
    // {
    //     //
    // }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CommodityCategory $commodityCategory)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'desc' => 'required|string|max:255',
        ]);

        $commodityCategory->update($request->all());

        return response()->json(['message' => 'Commodity updated successfully']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CommodityCategory $commodityCategory)
    {
        $commodityCategory->delete();

        return response()->json(['message' => 'Commodity deleted successfully']);
    }
}
