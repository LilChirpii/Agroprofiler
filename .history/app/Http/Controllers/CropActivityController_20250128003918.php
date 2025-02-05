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

     public function showIndex(Request $request)
    {
        $cropActivities = CropActivity::all()->toArray();

        return Inertia::render('Admin/List/Crop_Activity/CropActivityFolder', [
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

    public function admin($id)
    {

        $activityExists = CropActivity::find($id);
        if (!$activityExists) {
            return redirect()->route('admin.dashboard')->with('error', 'Crop activity not found');
        }

        $images = Images::where('crop_activity_id', $id)->get();

        return Inertia::render('Admin/List/Crop_Activity/Images', [
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
        'farmer_id' => 'required|exists:farmers,id',
        'title' => 'required|string|max:255',
        'desc' => 'nullable|string',
        'file_path' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048', // Validate file upload
        'date' => 'nullable|date',
    ]);

    $filePath = null;
    if ($request->hasFile('file_path')) {
        $filePath = $request->file('file_path')->store('crop_activities', 'public');
    }

    CropActivity::create([
        'farmer_id' => $request->farmer_id,
        'title' => $request->title,
        'desc' => $request->desc,
        'file_path' => $filePath,
        'date' => $request->date,
    ]);

    return redirect()->back()->with('success', 'Crop activity added successfully.');
}


    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CropActivity $id)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'date' => 'nullable|date',
        ]);

        $id->update([
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
           return redirect()->back()->with('success', 'Data Deleted successfully');
        }

        return redirect()->back()->with('success', 'Data Deleted successfully');

    }

    public function adminDestroy($id)
    {
        $cropActivity = CropActivity::find($id);
        if ($cropActivity) {
            $cropActivity->delete();
           return redirect()->back()->with('success', 'Data Deleted successfully');
        }

        return redirect()->back()->with('success', 'Data Deleted successfully');

    }
}
