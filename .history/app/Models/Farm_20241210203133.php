<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Farm extends Model
{
    use HasFactory;

    protected $table = 'farms';

    // Define the fillable fields for mass assignment
    protected $fillable = [
        'farmer_id',
        'brgy_id',
        'commodity_id',
        'ha',
        'owner',
        'latitude',
        'longitude'
    ];

    // Define relationships with the other models

    // Relationship to the Farmer model
    public function farmer()
    {
        return $this->belongsTo(Farmer::class, 'farmer_id');
    }

    public function farmer()
    {
        return $this->belongsTo(Farmer::class, 'farmer_id');
    }

    public function commodity()
    {
        return $this->belongsTo(Commodity::class, 'commodity_id');
    }
}
