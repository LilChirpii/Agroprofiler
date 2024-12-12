<?php

namespace Database\Seeders;

use App\Models\CropDamageCause;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CropDamageCauseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $cropdamagecauses = include database_path('data/crop_damage_cause.php');
        foreach ($cropdamagecauses as $cropdamagecause) {
            CropDamageCause::create($cropdamagecause);
        }
    }
} 