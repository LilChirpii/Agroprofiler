<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Farm extends Model
{
    use HasFactory;

    protected $guarded = [
        'farmer_id',
        'brgy_id',
        'ha',
        'commodity_id',
        'owner',
    ];

    public function farmer()
    {
        return $this->belongsTo(Farmer::class, 'farmer_id');
    }

    public function commodity()
    {
        return $this->belongsTo(Commodity::class, 'commodity_id'); 
    }
}