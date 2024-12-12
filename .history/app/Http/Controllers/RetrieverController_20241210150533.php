<?php

namespace App\Http\Controllers;

use App\Models\Farmer;
use Illuminate\Http\Request;

class RetrieverController extends Controller
{
    public function farmer(Request $request){
        $farmer = Farmer::all();
    }
}
