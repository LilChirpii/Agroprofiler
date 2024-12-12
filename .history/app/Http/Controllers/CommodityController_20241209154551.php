<?php

namespace App\Http\Controllers;

use App\Models\Commodity;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CommodityController extends Controller
{
    /**
     * Display a listing of the commodities.
     */
    public function index(Request $request)
    {
        $commodity = Commodity::all();

        return Inertia::render("Super Admin/List/Commodity_Sub/Commodity_Sub", [
            'commodity' => $commodity,
        ]);
    }

    public function show()
    {
        return response()->json(Commodity::all());
    }

    /**
     * Store a newly created commodity in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'desc' => 'required|string',
        ]);


        $commodity = new Commodity();
        $commodity->name = $request->input('name');
        $commodity->desc = $request->input('desc');

        $commodity->save();

        return redirect()->route('commodities.index');
    }


    /**
     * Update the specified commodity in storage.
     */
    public function update(Request $request, Commodity $commodity)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'desc' => 'nullable|string',
        ]);

        $commodity->update($validatedData);

        return redirect()->back()->with('message', 'Commodity updated successfully');
    }

    /**
     * Remove the specified commodity from storage.
     */
    public function destroy(Commodity $commodity)
    {
        $commodity->delete();

        return redirect()->back()->with('message', 'Commodity deleted successfully');
    }
}
