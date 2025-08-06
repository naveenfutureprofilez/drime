@extends('common::prerender.base')

@section('head')
    @include('seo.transfer-homepage.seo-tags')
@endsection

@section('body')
    <h1>Quick File Transfer</h1>
    <p>Upload and share files instantly with secure guest upload.</p>
    
    <div>
        <h2>Upload Files</h2>
        <p>Drag and drop or click to select files to upload.</p>
    </div>
    
    <div>
        <h2>Share Securely</h2>
        <p>Get a secure link to share your files with anyone.</p>
    </div>
    
    <div>
        <h2>Download Anytime</h2>
        <p>Files are available for download until they expire.</p>
    </div>
@endsection
