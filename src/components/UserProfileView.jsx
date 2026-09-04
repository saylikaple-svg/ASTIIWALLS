import React, { useState } from 'react';
import { 
  Upload, 
  Heart, 
  ArrowLeft,
  Plus,
  Trash2,
  LogOut,
  AlertTriangle
} from 'lucide-react';
import { WallpaperCard } from './WallpaperCard';
import { useAuth } from '../context/AuthContext';
import { deleteWallpaperFromCloud } from '../services/firebase';

export const UserProfileView = ({
  allWallpapers,
  onSelectWallpaper,
  onOpenUpload,
  onOpenAuthModal,
  onBackToGallery,
  playClickSound,
  onWallpaperDeleted,
}) => {
  const { currentUser, likedIds, logout, showToast } = useAuth();
  const [activeTab, setActiveTab] = useState('uploads'); // 'uploads' | 'likes'
  const [deletingId, setDeletingId] = useState(null);

  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-display font-black text-3xl uppercase text-black">
          Please Sign In
        </h2>
        <p className="font-body text-sm text-gray-700">
          Sign in with Google to view your uploaded wallpapers and saved favorite collections.
        </p>
        <button
          onClick={() => onOpenAuthModal('signin')}
          className="btn-brutal-lime px-6 py-3 rounded-xl font-heading font-black text-xs uppercase cursor-pointer"
        >
          Sign In with Google
        </button>
      </div>
    );
  }

  // Filter wallpapers uploaded by this specific user
  const userUploads = allWallpapers.filter((wp) => {
    if (wp.isUserUploaded) {
      if (wp.author?.id && wp.author.id === currentUser.id) return true;
      if (wp.author?.email && wp.author.email === currentUser.email) return true;
      if (wp.author?.username && wp.author.username === currentUser.username) return true;
      // Fallback for custom uploads created before login
      return true;
    }
    return false;
  });

  // Filter wallpapers liked by this user
  const likedWallpapers = allWallpapers.filter((wp) => likedIds.includes(wp.id));

  const handleDelete = async (e, wp) => {
    e.stopPropagation();
    if (playClickSound) playClickSound();

    if (window.confirm(`Are you sure you want to permanently delete "${wp.title}"?`)) {
      setDeletingId(wp.id);
      try {
        await deleteWallpaperFromCloud(wp.id);
        if (onWallpaperDeleted) {
          onWallpaperDeleted(wp.id);
        }
        showToast(`"${wp.title}" was deleted permanently.`);
      } catch {
        showToast('Failed to delete wallpaper', 'error');
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
      {/* Back Button */}
      <button
        onClick={() => {
          if (playClickSound) playClickSound();
          onBackToGallery();
        }}
        className="btn-brutal bg-white hover:bg-gray-50 px-4 py-2 rounded-xl font-heading font-bold text-xs uppercase inline-flex items-center gap-2 cursor-pointer shadow-brutal-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Gallery</span>
      </button>

      {/* User Card */}
      <div className="bg-white border-3 border-black rounded-3xl p-6 sm:p-8 shadow-brutal-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-3 border-black shadow-brutal-sm bg-white"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="font-display font-black text-2xl sm:text-3xl text-black uppercase tracking-tight">
                {currentUser.name}
              </h1>
              <span className="bg-yestalgia-lime text-black text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-black shadow-sm">
                CREATOR
              </span>
            </div>
            <p className="font-mono text-xs text-gray-600">{currentUser.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => {
              if (playClickSound) playClickSound();
              onOpenUpload();
            }}
            className="btn-brutal-lime flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-heading font-black text-xs uppercase flex items-center justify-center gap-1.5 shadow-brutal cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Wallpaper</span>
          </button>

          <button
            onClick={() => {
              if (playClickSound) playClickSound();
              logout();
              onBackToGallery();
            }}
            className="btn-brutal bg-white hover:bg-red-50 text-red-600 px-4 py-2.5 rounded-xl font-heading font-bold text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div>
        <div className="flex items-center gap-2 border-b-2 border-black pb-4 mb-8">
          <button
            onClick={() => {
              if (playClickSound) playClickSound();
              setActiveTab('uploads');
            }}
            className={`btn-brutal px-5 py-2.5 rounded-xl font-heading font-black text-xs uppercase flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'uploads'
                ? 'bg-yestalgia-dark text-yestalgia-lime shadow-brutal-sm'
                : 'bg-white text-black'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>My Uploads ({userUploads.length})</span>
          </button>

          <button
            onClick={() => {
              if (playClickSound) playClickSound();
              setActiveTab('likes');
            }}
            className={`btn-brutal px-5 py-2.5 rounded-xl font-heading font-black text-xs uppercase flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'likes'
                ? 'bg-yestalgia-pink text-black shadow-brutal-sm'
                : 'bg-white text-black'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Saved Favorites ({likedWallpapers.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'uploads' && (
          <div>
            {userUploads.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {userUploads.map((wp) => (
                  <div key={wp.id} className="relative group flex flex-col">
                    <WallpaperCard
                      wallpaper={wp}
                      onSelect={onSelectWallpaper}
                      onNavigateSignIn={onOpenAuthModal}
                      playClickSound={playClickSound}
                    />

                    {/* Prominent Delete Option */}
                    <div className="mt-2 flex items-center justify-between bg-red-50 border-2 border-red-400 rounded-xl px-3 py-2 shadow-sm">
                      <span className="text-[11px] font-mono text-red-800 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                        Manage
                      </span>
                      <button
                        onClick={(e) => handleDelete(e, wp)}
                        disabled={deletingId === wp.id}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-heading font-black uppercase flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                        title="Delete wallpaper permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{deletingId === wp.id ? 'Deleting...' : 'Delete'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-16 text-center bg-white border-3 border-black rounded-3xl shadow-brutal max-w-md mx-auto space-y-4">
                <p className="font-heading font-black text-lg text-black uppercase">
                  No Uploads Yet
                </p>
                <p className="font-body text-sm text-gray-600">
                  Upload your high-res mobile or laptop wallpaper to see it in your portfolio and share it with the world.
                </p>
                <button
                  onClick={onOpenUpload}
                  className="btn-brutal-lime px-5 py-2.5 rounded-xl font-heading font-black text-xs uppercase cursor-pointer"
                >
                  Upload Wallpaper
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'likes' && (
          <div>
            {likedWallpapers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {likedWallpapers.map((wp) => (
                  <WallpaperCard
                    key={wp.id}
                    wallpaper={wp}
                    onSelect={onSelectWallpaper}
                    onNavigateSignIn={onOpenAuthModal}
                    playClickSound={playClickSound}
                  />
                ))}
              </div>
            ) : (
              <div className="p-16 text-center bg-white border-3 border-black rounded-3xl shadow-brutal max-w-md mx-auto space-y-4">
                <p className="font-heading font-black text-lg text-black uppercase">
                  No Favorites Saved
                </p>
                <p className="font-body text-sm text-gray-600">
                  Click the heart icon on any wallpaper in the feed to save it here.
                </p>
                <button
                  onClick={onBackToGallery}
                  className="btn-brutal-pink px-5 py-2.5 rounded-xl font-heading font-black text-xs uppercase cursor-pointer"
                >
                  Browse Wallpapers
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
