<?php

namespace App\Http\Controllers;

use App\Models\Allocation;
use App\Models\CropDamage;
use App\Models\Farm;
use App\Models\Farmer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FarmProfileController extends Controller
{
    public function index($id)
    {
        
        $farmer = Farmer::with(['allocations', 'cropDamages', 'barangay', 'farms.commodity'])
        ->findOrFail($id); 
        $damages = CropDamage::with('farmer_id', '$id');
        $allocations = Allocation::with('farmer_id', '$id');

        return Inertia::render('Super Admin/List/Farmers/FarmProfile/FarmProfile', [
            'farmer' => $farmer,
            'damages' => $damages,
            'allocations' => $allocations
        ]);
    }
}