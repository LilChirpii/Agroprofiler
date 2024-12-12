<?php

namespace App\Http\Controllers;

use App\Models\CropActivity;
use App\Models\Images;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CropActivityController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $cropActivities = CropActivity::all()->toArray();

        return Inertia::render('Super Admin/List/Crop_Activity/CropActivityFolder', [
            'initialFolders' => $cropActivities,
        ]);
    }

    public function images($id)
    {

        $activityExists = CropActivity::find($id);
        if (!$activityExists) {
            return redirect()->route('dashboard')->with('error', 'Crop activity not found');
        }

        $images = Images::where('crop_activity_id', $id)->get();

        return Inertia::render('Super Admin/List/Crop_Activity/Images', [
            'images' => $images,
            'cropActivityId' => $id,
        ]);
    }



    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'date' => 'required|date', // Ensure date is required and in correct format
        ]);

        CropActivity::create([
            'title' => $request->title,
            'date' => $request->date, // Pass date directly from request
        ]);

        return redirect()->route('crop.activity.index');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CropActivity $cropActivity)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'date' => 'nullable|date',
        ]);

        $cropActivity->update([
            'title' => $request->title,
            'date' => $request->date,
        ]);

        return redirect()->back()->with('success', 'Crop activity updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $cropActivity = CropActivity::find($id);
        if ($cropActivity) {
            $cropActivity->delete();
            return redirect()->route('crop.activity.index')->with('success', 'Activity updated successfully');
        }

        return redirect()->back()->with('success', 'Crop activity deleted successfully!');
    }
}
