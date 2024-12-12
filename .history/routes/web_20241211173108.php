<?php

use App\Http\Controllers\AllocationController;
use App\Http\Controllers\AllocationTypeController;
use App\Http\Controllers\BarangayController;
use App\Http\Controllers\CommodityCategoryController;
use App\Http\Controllers\CommodityController;
use App\Http\Controllers\CropActivityController;
use App\Http\Controllers\CropDamageCauseController;
use App\Http\Controllers\CropDamagesController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DistributionController;
use App\Http\Controllers\ElligibilityController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\FarmController;
use App\Http\Controllers\FarmerController;
use App\Http\Controllers\FarmProfileController;
use App\Http\Controllers\GeospatialController;
use App\Http\Controllers\ImagesController;
use App\Http\Controllers\MapController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RecommendationController;
use App\Http\Controllers\RetrieverController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\UsersController;
use App\Models\AllocationType;
use App\Models\CropDamageCause;
use App\Models\Elligibility;
use App\Models\FarmerElligibility;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Auth/Login', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware(['auth', 'admin'])->group(function(){
    Route::get('/admin/dashboard', [DashboardController::class, 'showAdmin'])->name('admin.dashboard');
});




Route::middleware(['auth', 'super admin'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/report/resource-allocation-breakdown', [RecommendationController::class, 'generateAllocationBreakdownReport']);
    Route::get('/generate-report', [RecommendationController::class, 'generateReport']);

    //dashboard
    Route::get('/barangays/data', [AllocationController::class, 'showBarangays'])->name('barangay.data');
    Route::get('/allocations/data', [AllocationController::class, 'showAllocations'])->name('allocations.data');
    Route::get('/farmers/data', [FarmerController::class, 'showFarmers'])->name('farmers.data');
    Route::get('/users/data', [UsersController::class, 'showUsers'])->name('users.data');
    Route::get('/heatmap-data', [DashboardController::class, 'getHeatmapData']);

    Route::delete('/cropdamages/destroy/{id}', [CropDamagesController::class, 'destroy'])->name('crop.damages.destroy');
    Route::post('/store/cropdamages', [CropDamagesController::class, 'store'])->name('crop.damages.store');
    Route::post('/cropdamages/update/{id}', [CropDamagesController::class, 'update'])->name('crop.damages.update');
    Route::get('/cropdamages/data', [CropDamagesController::class, 'showCropDamages'])->name('crop.damages.data');
    Route::get('/cropdamages/get', [CropDamagesController::class, 'index'])->name('crop.damages.index');

    //allocation type
    Route::get('/allocation/allocationtype', [AllocationTypeController::class, 'index'])->name('allocation.type.index');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    //commodity category
    Route::get('/commodity-categories-show', [CommodityCategoryController::class, 'show'])->name('commodity.category.index');
    Route::get('/commodity-categories-list', [CommodityCategoryController::class, 'index'])->name('commodity.index');
    Route::post('/commodity-categories/store', [CommodityCategoryController::class, 'store']);
    Route::put('/commodities-categories/update/{id}', [CommodityController::class, 'update']);
    Route::delete('/commodity-categories/destroy/{id}', [CommodityCategoryController::class, 'destroy']);


    //commodities/
    Route::put('/commodities/update/{id}', [CommodityController::class, 'update']);
    Route::get('/commodities/show', [CommodityController::class, 'show']);
    Route::post('/commodities/store', [CommodityController::class, 'store'])->name('commodities.store');
    Route::get('/commodities/list', [CommodityController::class, 'index'])->name('commodity.list.index');
    Route::post('/commodities/save', [CommodityController::class, 'store']);
    Route::put('/commodities-categories/update/{id}', [CommodityCategoryController::class, 'update']);
    Route::delete('/commodities/destroy/{id}', [CommodityController::class, 'destroy']);

    //users
    Route::get('/users', [UsersController::class, 'index'])->name('users.index');
    Route::delete('/users/destroy/{id}', [UsersController::class, 'destroy'])->name('users.destroy');
    Route::post('/users/store', [UsersController::class, 'store'])->name('users.store');
    Route::put('/users/update/{id}', [UsersController::class, 'update']);

    Route::get('/map/farm', [MapController::class, 'index'])->name('map.index');

    //farmprofile
    Route::get('/farmprofile/{id}', [FarmProfileController::class, 'index'])->name('farm.profile.index');
    Route::get('/data/farmprofile/{id}', [FarmProfileController::class, 'show'])->name('farm.profile.index');

    //Farmers
    Route::get('/farmers', [FarmerController::class, 'index'])->name('farmers.index');
    Route::post('/farmers/store', [FarmerController::class, 'store'])->name('farmers.store');
    Route::put('/farmers/update/{id}', [FarmerController::class, 'update']);
    Route::post('/farmers/update/{id}', [FarmerController::class, 'update']);
    Route::delete('/farmers/destroy/{id}', [FarmerController::class, 'destroy'])->name('farmers.destroy');

    //farms
    Route::post('/farms/store', [FarmController::class, 'store']);
    // Update an existing farm
    Route::put('/farms/update/{id}', [FarmController::class, 'update']);
    // Delete a farm
    Route::delete('/farms/destroy/{id}', [FarmController::class, 'destroy']);

    //allocations
    Route::get('/allocations', [AllocationController::class, 'index'])->name('allocations.index');
    Route::delete('/allocations/destroy/{id}', [AllocationController::class, 'destroy'])->name('allocation.destroy');
    Route::post('/allocations/store', [AllocationController::class, 'store'])->name('allocation.store');
    Route::put('/allocations/update/{id}', [AllocationController::class, 'update'])->name('allocation.update');

   //cropactivity
    Route::get('/cropactivity', [CropActivityController::class, 'index'])->name('crop.activity.index');
    Route::patch('/cropactivity/update/{id}', [CropActivityController::class, 'update'])->name('crop.activity.update');
    Route::delete('/cropactivity/destroy/{id}', [CropActivityController::class, 'destroy'])->name('crop.activity.destroy');
    Route::post('/cropactivity/store', [CropActivityController::class, 'store'])->name('crop.activity.store');
    Route::delete('/cropactivity/destroy/{id}', [CropActivityController::class, 'destroy'])->name('crop.activity.destroy');

    //images
    Route::get('/cropactivity/images/{id}', [ImagesController::class, 'images'])->name('crop.activity.images');
    Route::post('/cropactivity/images/store', [ImagesController::class, 'store'])->name('crop.images.activity.store');
    Route::put('/cropactivity/images/update/{id}', [ImagesController::class, 'update'])->name('crop.images.activity.update');
    Route::delete('/images/{id}', [ImagesController::class, 'destroy']);

    Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::get('/recommendations', [RecommendationController::class, 'index'])->name('recommendations.index');
    Route::get('/export-pdf', [ExportController::class, 'exportPDF']);
    Route::get('/geospatial', [GeospatialController::class, 'index'])->name('geospatial.index');

    Route::post('/recommend-allocations', [RecommendationController::class, 'recommendAllocations']);
    Route::get('/api/recommend-allocations', [RecommendationController::class, 'recommendAllocations']);
    Route::get('/allocation-types', [RecommendationController::class, 'listAllocationTypes']);

    Route::get('/allocation-types-list', [AllocationTypeController::class, 'show']);
    Route::get('/commodities', [CommodityController::class, 'show']);
    Route::get('/barangays', [BarangayController::class, 'index']);
    Route::get('/crop-damages-causes', [CropDamageCauseController::class, 'index'])->name('crop.damage.causes');
    Route::get('/crop-damages-ui', [CropDamageCauseController::class, 'show'])->name('crop.damage.show');
    Route::get('/eligibilities', [ElligibilityController::class, 'index']);

    //crop damage causes
    Route::get('/crop-damage-causes', [CropDamageCauseController::class, 'index']);
    Route::post('/crop-damage-causes/store', [CropDamageCauseController::class, 'store']);
    Route::put('/crop-damage-causes/update/{id}', [CropDamageCauseController::class, 'update']);
    Route::delete('/crop-damage-causes/destroy/{id}', [CropDamageCauseController::class, 'destroy']);

    Route::get('/api/farmers-distribution', [DistributionController::class, 'getFarmersDistribution']);
    Route::get('/api/farmers', [DashboardController::class, 'getFarmersDistribution']);
    Route::get('/api/allocations', [DashboardController::class, 'getAllocationsDistribution']);
    Route::get('/api/stacked-data', [DashboardController::class, 'getStackedData']);

    Route::get('/data/farmers', [RetrieverController::class, 'farmer']);
    Route::get('/data/barangay', [RetrieverController::class, 'barangay']);
    Route::get('/data/commodity', [RetrieverController::class, 'commodity']);
    Route::get('/data/allocationtype', [RetrieverController::class, 'allocationType']);
    Route::get('/data/cropDamageCause', [RetrieverController::class, 'cropDamageCause']);

});

require __DIR__.'/auth.php';
