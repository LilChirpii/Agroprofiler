<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AllocationTypeCommodity extends Model
{
    use HasFactory;

    protected $fillable = ['allocation_type_id', 'commodity_id'];

    public function commodity()
    {
        return $this->belongsTo(Commodity::class);
    }

     public function allocation()
    {
        return $this->belongsTo(Allocation::class);
    }
}