<?php

namespace App\Http\Controllers;

use App\Models\CropDamageCause;
use Illuminate\Http\Request;

class CropDamageCauseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(CropDamageCause::all());
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
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(CropDamageCause $cropDamageCause)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(CropDamageCause $cropDamageCause)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CropDamageCause $cropDamageCause)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CropDamageCause $cropDamageCause)
    {
        //
    }
}