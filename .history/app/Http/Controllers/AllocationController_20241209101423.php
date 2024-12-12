<?php

namespace App\Http\Controllers;

use App\Models\Allocation;
use App\Models\Barangay;
use App\Models\Commodity;
use App\Models\Farmer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AllocationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        
        $allocations = Allocation::with(['farmer', 'commodity', 'barangay'])->paginate(20);
            $commodity = Commodity::all();
            $barangay = Barangay::all();
            $farmer = Farmer::all();
       
        return Inertia::render('Super Admin/List/Allocations/AllocationList', [
            'allocation' => $allocations,
            'commodities' => $commodity,
            'barangays' => $barangay,
            'farmers' => $farmer,
        ]);
    }

    public function showAllocations(){
        $allocations = Allocation::with(['farmer', 'commodity', 'barangay'])->get();
        $commodity = Commodity::all();
        $barangay = Barangay::all();
        $farmer = Farmer::all();
        // return response()->json([ 
        //     'allocation' => $allocations,
        //     'commodities' => $commodity,
        //     'barangays' => $barangay,
        //     'farmer' => $farmer]);
        return response($allocations);
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
            'allocation_type' => 'required|string|max:255',
            'farmer_id' => 'required|exists:farmers,id', 
            'received' => 'required|in:yes,no', 
            'brgy_id' => 'required|exists:barangays,id', 
            'commodity_id' => 'required|exists:commodities,id', 
            'date_received' => 'nullable|date', 
        ]);

        $allocation = new Allocation();
        $allocation->allocation_type = $request->allocation_type;
        $allocation->farmer_id = $request->farmer_id;
        $allocation->received = $request->received;
        $allocation->brgy_id = $request->brgy_id;
        $allocation->commodity_id = $request->commodity_id;
        $allocation->date_received = $request->date_received;

       
        $allocation->save();

       
        return redirect()->route('allocations.index')->with('success', 'Allocation created successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(Allocation $allocation)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Allocation $allocation)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $allocation = Allocation::findOrFail($id);
        // Validate incoming request data
        $request->validate([
            'allocation_type' => 'required|string|max:255',
            'farmer_id' => 'required|exists:farmers,id', 
            'received' => 'required|in:yes,no', 
            'brgy_id' => 'required|exists:barangays,id', 
            'commodity_id' => 'required|exists:commodities,id', 
            'date_received' => 'nullable|date', 
        ]);

        // Update the allocation with validated data
        $allocation->allocation_type = $request->allocation_type;
        $allocation->farmer_id = $request->farmer_id;
        $allocation->received = $request->received;
        $allocation->brgy_id = $request->brgy_id;
        $allocation->commodity_id = $request->commodity_id;
        $allocation->date_received = $request->date_received;

        // Save the changes to the database
        $allocation->save();

        // Redirect with success message
        return redirect()->route('allocations.index')->with('success', 'Allocation updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $allocation = Allocation::find($id);
        if ($allocation) {
            $allocation->delete();
            return redirect()->route('allocations.index')->with('success', 'Allocation deleted successfully');
        }
        return response()->json(['message' => 'allocation not found'], 404);
    }
}