import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchTrips } from '../api/tripsApi';
import {
  MessageSquare, Heart, Bookmark, Share2, Search, Filter,
  SlidersHorizontal, Plus, Star, MapPin, Calendar, UserCheck,
  CheckCircle2, Sparkles, Send, X, ThumbsUp, Eye, Compass,
  Layers, ExternalLink, Image as ImageIcon
} from 'lucide-react';

// Initial sample community posts data matching Screen 10 wireframe
const INITIAL_POSTS = [
  {
    id: 'post-1',
    author: {
      name: 'Alex Rivera',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      badge: 'Verified Explorer',
      tripsCount: 14
    },
    tripTitle: 'European Grand Journey — Paris & Rome',
    destination: 'Paris & Rome, Europe',
    category: 'Culture & History',
    season: 'Autumn 2026',
    coverPhoto: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
    rating: 5,
    likes: 142,
    isLiked: false,
    saves: 38,
    isSaved: false,
    datePosted: '2 hours ago',
    experienceText: 'Ascending the Eiffel Tower at golden hour was unforgettable, but the quiet evening stroll through Trastevere in Rome with fresh gelato took the trophy! Make sure to pre-book Louvre fast-track tickets at least 2 weeks in advance.',
    highlights: ['Eiffel Tower Summit Tour', 'Louvre Museum Walk', 'Colosseum Underground', 'Trastevere Food Crawl'],
    comments: [
      { id: 'c1', author: 'Elena Rostova', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80', text: 'Stunning photos Alex! Did you take the overnight train between Paris and Rome?', time: '1 hour ago' },
      { id: 'c2', author: 'Marcus Vance', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80', text: 'Trastevere gelaterias are unmatched! Adding this to my bucket list.', time: '30 mins ago' }
    ]
  },
  {
    id: 'post-2',
    author: {
      name: 'Kenji Takahashi',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      badge: 'Local Guide',
      tripsCount: 29
    },
    tripTitle: 'Kyoto Temple Trails & Bamboo Groves',
    destination: 'Kyoto, Japan',
    category: 'Backpacking & Nature',
    season: 'Spring 2026',
    coverPhoto: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    rating: 5,
    likes: 98,
    isLiked: true,
    saves: 52,
    isSaved: true,
    datePosted: '5 hours ago',
    experienceText: 'Pro-tip for Fushimi Inari: start your hike at 6:00 AM! You get the 10,000 torii gates almost entirely to yourself before tour buses arrive. Arashiyama bamboo forest is equally serene in early fog.',
    highlights: ['Fushimi Inari Torii Hike', 'Arashiyama Bamboo Forest', 'Matcha Tea Ceremony'],
    comments: [
      { id: 'c3', author: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80', text: 'Early morning tip is a lifesaver! Thanks Kenji.', time: '2 hours ago' }
    ]
  },
  {
    id: 'post-3',
    author: {
      name: 'Sophia Laurent',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      badge: 'Food & Wine Connoisseur',
      tripsCount: 8
    },
    tripTitle: 'Barcelona Tapas & Gaudí Architecture Escape',
    destination: 'Barcelona, Spain',
    category: 'Food & Wine',
    season: 'Summer 2026',
    coverPhoto: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1200&q=80',
    rating: 4.9,
    likes: 215,
    isLiked: false,
    saves: 84,
    isSaved: false,
    datePosted: '1 day ago',
    experienceText: 'Sagrada Família interior lighting during late afternoon is pure magic. Paella at Barceloneta beach accompanied by local Catalan vermouth is a non-negotiable experience!',
    highlights: ['Sagrada Família Entry', 'Gothic Quarter Tapas Crawl', 'Park Güell Stroll'],
    comments: []
  }
];

export default function CommunityPage({ onNavigate, initialShareTripId }) {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [userTrips, setUserTrips] = useState([]);
  
  // Search, Filter, Grouping & Sort states (Screen 10 wireframe)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all'); // 'all', 'Europe', 'Asia', 'North America'
  const [selectedFilter, setSelectedFilter] = useState('All'); // 'All', 'Popular', 'Backpacking', 'Food & Wine', 'Culture & History'
  const [sortBy, setSortBy] = useState('most-liked'); // 'most-liked', 'newest', 'top-rated'
  
  // Post modal states
  const [isPostModalOpen, setIsPostModalOpen] = useState(Boolean(initialShareTripId));
  const [newPostTripId, setNewPostTripId] = useState(initialShareTripId || '');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostDestination, setNewPostDestination] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('Culture & History');
  const [newPostCover, setNewPostCover] = useState('https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80');
  const [newPostText, setNewPostText] = useState('');
  const [newPostRating, setNewPostRating] = useState(5);

  // Active Comment Drawer state
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentInput, setCommentInput] = useState('');
  const [copyNotification, setCopyNotification] = useState('');

  // Fetch user's trips if logged in
  useEffect(() => {
    if (isAuthenticated) {
      fetchTrips().then(data => {
        if (data && data.length > 0) {
          setUserTrips(data);
          if (initialShareTripId) {
            const matched = data.find(t => t.id === initialShareTripId);
            if (matched) {
              setNewPostTitle(matched.name);
              setNewPostDestination(matched.description || 'Global Destination');
              if (matched.coverPhoto) setNewPostCover(matched.coverPhoto);
            }
          }
        }
      }).catch(() => {});
    }
  }, [isAuthenticated, initialShareTripId]);

  // Handle pre-filling form when selecting a user trip
  const handleSelectTripForPost = (tripId) => {
    setNewPostTripId(tripId);
    if (!tripId) return;
    const selected = userTrips.find(t => t.id === tripId);
    if (selected) {
      setNewPostTitle(selected.name);
      setNewPostDestination(selected.description || 'Custom Itinerary Route');
      if (selected.coverPhoto) setNewPostCover(selected.coverPhoto);
    }
  };

  // Toggle Like
  const handleToggleLike = (postId) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const nextLiked = !p.isLiked;
        return {
          ...p,
          isLiked: nextLiked,
          likes: nextLiked ? p.likes + 1 : p.likes - 1
        };
      }
      return p;
    }));
  };

  // Toggle Save
  const handleToggleSave = (postId) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const nextSaved = !p.isSaved;
        return {
          ...p,
          isSaved: nextSaved,
          saves: nextSaved ? p.saves + 1 : p.saves - 1
        };
      }
      return p;
    }));
    setCopyNotification('Trip experience saved to your bookmark list!');
    setTimeout(() => setCopyNotification(''), 3000);
  };

  // Share Post Link
  const handleSharePost = (post) => {
    const shareUrl = `${window.location.origin}/community?post=${post.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopyNotification(`Copied community link for "${post.tripTitle}" to clipboard!`);
    } else {
      setCopyNotification(`Shared "${post.tripTitle}"!`);
    }
    setTimeout(() => setCopyNotification(''), 3000);
  };

  // Add Comment
  const handleAddComment = (postId) => {
    if (!commentInput.trim()) return;
    const newCommentObj = {
      id: `c-${Date.now()}`,
      author: user?.name || 'Fellow Explorer',
      avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      text: commentInput.trim(),
      time: 'Just now'
    };

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, comments: [...p.comments, newCommentObj] };
      }
      return p;
    }));

    setCommentInput('');
  };

  // Create New Experience Post
  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostText.trim()) return;

    const createdPost = {
      id: `post-${Date.now()}`,
      author: {
        name: user?.name || 'Explorer',
        avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        badge: 'Verified Explorer',
        tripsCount: (userTrips.length || 1)
      },
      tripTitle: newPostTitle,
      destination: newPostDestination || 'Wanderers Route',
      category: newPostCategory,
      season: '2026 Season',
      coverPhoto: newPostCover || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
      rating: newPostRating,
      likes: 1,
      isLiked: true,
      saves: 0,
      isSaved: false,
      datePosted: 'Just now',
      experienceText: newPostText,
      highlights: ['Custom Itinerary', 'Local Explorer Recommendation'],
      comments: []
    };

    setPosts([createdPost, ...posts]);
    setIsPostModalOpen(false);
    setNewPostTitle('');
    setNewPostDestination('');
    setNewPostText('');
    setCopyNotification('Your experience post was successfully published to the Community!');
    setTimeout(() => setCopyNotification(''), 4000);
  };

  // Filter & Sort Logic
  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      post.tripTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.experienceText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGroup = selectedGroup === 'all' || post.destination.toLowerCase().includes(selectedGroup.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || post.category === selectedFilter || (selectedFilter === 'Popular' && post.likes > 100);

    return matchesSearch && matchesGroup && matchesFilter;
  }).sort((a, b) => {
    if (sortBy === 'most-liked') return b.likes - a.likes;
    if (sortBy === 'top-rated') return b.rating - a.rating;
    return 0; // default order
  });

  return (
    <div className="w-full px-6 sm:px-12 pt-4 pb-20 space-y-8 font-sans">
      
      {/* Toast Notification */}
      {copyNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#F5B800] text-[#1E232A] px-6 py-3.5 rounded-full font-bold text-sm shadow-2xl flex items-center gap-2 animate-bounce border border-black/10">
          <CheckCircle2 className="h-5 w-5 text-[#1E232A]" />
          {copyNotification}
        </div>
      )}

      {/* Screen 10 Header & Wireframe Banner */}
      <div className="bg-[#1A1D23] text-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-gray-800 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 z-10 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#F5B800] text-[#1E232A] text-[11px] font-extrabold tracking-widest uppercase rounded-full">
              Screen 10 &bull; Community Hub
            </span>
            <span className="text-gray-400 text-xs font-medium">Public Explorer Feed</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-serif font-black tracking-tight text-white">
            Community tab
          </h1>
          <p className="text-sm text-gray-300 leading-relaxed font-sans">
            Community section where all users can share their experience of a certain trip or activity. Use search, group by, filter, and sort by options to narrow down the results you're looking for.
          </p>
        </div>

        {/* Share Experience CTA Button */}
        <div className="z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={() => {
              if (!isAuthenticated) {
                onNavigate('auth');
              } else {
                setIsPostModalOpen(true);
              }
            }}
            className="px-6 py-3.5 bg-[#F5B800] hover:bg-[#E0A600] text-[#1E232A] font-extrabold text-sm uppercase tracking-widest transition shadow-xl flex items-center justify-center gap-2 rounded-full cursor-pointer"
          >
            <Plus className="h-5 w-5" />
            SHARE EXPERIENCE
          </button>
        </div>

        {/* Background Decorative Graphic */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-12">
          <Compass className="h-96 w-96 text-white" />
        </div>
      </div>

      {/* Controls Bar (Search Bar, Group by, Filter, Sort by... matching Screen 10 Sketch) */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xl space-y-4">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* 1. Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bar ...... (city, activity, story, author)"
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-[#F5B800] font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Controls Dropdowns: Group By, Filter, Sort By */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Group By Dropdown */}
            <div className="flex items-center gap-2 bg-gray-100 px-4 py-2.5 rounded-full border border-gray-300 text-xs font-bold uppercase tracking-wider text-gray-700">
              <span className="text-gray-400">Group by:</span>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="bg-transparent text-[#1E232A] font-extrabold focus:outline-none cursor-pointer"
              >
                <option value="all">All Regions</option>
                <option value="Europe">Europe</option>
                <option value="Asia">Asia</option>
                <option value="Japan">Japan</option>
                <option value="France">France</option>
              </select>
            </div>

            {/* Sort By Dropdown */}
            <div className="flex items-center gap-2 bg-gray-100 px-4 py-2.5 rounded-full border border-gray-300 text-xs font-bold uppercase tracking-wider text-gray-700">
              <span className="text-gray-400">Sort by...:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-[#1E232A] font-extrabold focus:outline-none cursor-pointer"
              >
                <option value="most-liked">Most Liked</option>
                <option value="newest">Newest First</option>
                <option value="top-rated">Highest Rated</option>
              </select>
            </div>

          </div>
        </div>

        {/* Filter Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2">
          <span className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mr-2 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5 text-[#F5B800]" /> Filter:
          </span>
          {['All', 'Popular', 'Culture & History', 'Backpacking & Nature', 'Food & Wine', 'Luxury'].map(filterTag => (
            <button
              key={filterTag}
              onClick={() => setSelectedFilter(filterTag)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider transition cursor-pointer whitespace-nowrap ${
                selectedFilter === filterTag
                  ? 'bg-[#1E232A] text-[#F5B800] shadow'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filterTag}
            </button>
          ))}
        </div>

      </div>

      {/* Community Feed Grid (Post Cards with Circular Avatars on Left as per Wireframe) */}
      <div className="space-y-8">
        {filteredPosts.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center space-y-4 shadow-sm">
            <Compass className="h-16 w-16 text-gray-300 mx-auto" />
            <h3 className="text-xl font-bold font-serif text-[#1E232A]">No community posts found</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Try adjusting your search criteria or filter tags to discover shared community trip experiences.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedFilter('All');
                setSelectedGroup('all');
              }}
              className="px-5 py-2.5 bg-[#F5B800] text-[#1E232A] font-extrabold text-xs uppercase tracking-widest rounded-full"
            >
              RESET FILTERS
            </button>
          </div>
        ) : (
          filteredPosts.map(post => (
            <div
              key={post.id}
              className="bg-white border border-gray-200 rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition duration-300 flex flex-col md:flex-row"
            >
              {/* Left Column: Author Circle Avatar & Info (Exact Wireframe Match) */}
              <div className="w-full md:w-72 bg-[#1A1D23] text-white p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-800">
                <div className="space-y-4">
                  
                  {/* Large Profile Circle Bubble */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-[#F5B800] shadow-md"
                      />
                      <span className="absolute -bottom-1 -right-1 bg-[#F5B800] text-[#1E232A] p-1 rounded-full">
                        <UserCheck className="h-3 w-3" />
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-base text-white">{post.author.name}</h4>
                      <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#F5B800] block">
                        {post.author.badge}
                      </span>
                      <span className="text-[10px] text-gray-400 block mt-0.5">
                        {post.author.tripsCount} Public Trips
                      </span>
                    </div>
                  </div>

                  <hr className="border-gray-800" />

                  {/* Post Metadata */}
                  <div className="space-y-2 text-xs text-gray-300 font-sans">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#F5B800]" />
                      <span>{post.destination}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-[#F5B800]" />
                      <span>{post.season}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-[#F5B800] fill-[#F5B800]" />
                      <span className="font-extrabold text-white">{post.rating} / 5.0</span>
                    </div>
                  </div>

                </div>

                <div className="pt-4 border-t border-gray-800 text-[11px] text-gray-400 flex items-center justify-between">
                  <span>Shared {post.datePosted}</span>
                  <span className="px-2.5 py-0.5 bg-white/10 text-white rounded-full font-bold uppercase text-[9px]">
                    {post.category}
                  </span>
                </div>
              </div>

              {/* Right Column: Experience Content & Media */}
              <div className="flex-1 p-6 md:p-8 flex flex-col justify-between space-y-6">
                
                <div className="space-y-4">
                  {/* Trip Title */}
                  <h3 className="text-2xl sm:text-3xl font-serif font-black text-[#1E232A] leading-tight">
                    {post.tripTitle}
                  </h3>

                  {/* Experience Image Banner */}
                  <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden shadow-md group">
                    <img
                      src={post.coverPhoto}
                      alt={post.tripTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4 text-white flex items-center justify-between">
                      <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-bold text-[#F5B800]">
                        📍 {post.destination}
                      </span>
                    </div>
                  </div>

                  {/* Experience Story Text */}
                  <p className="text-sm text-gray-700 leading-relaxed font-sans font-medium">
                    "{post.experienceText}"
                  </p>

                  {/* Visited Highlights */}
                  {post.highlights && post.highlights.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Highlights:</span>
                      {post.highlights.map((h, i) => (
                        <span key={i} className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-bold rounded-full border border-gray-200">
                          &bull; {h}
                        </span>
                      ))}
                    </div>
                  )}

                </div>

                {/* Interactive Action Bar (Like, Save, Share, Comments) */}
                <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4 font-sans text-xs font-bold">
                  
                  <div className="flex items-center gap-3">
                    {/* Like Button */}
                    <button
                      onClick={() => handleToggleLike(post.id)}
                      className={`px-4 py-2 rounded-full border transition flex items-center gap-2 cursor-pointer ${
                        post.isLiked
                          ? 'bg-rose-50 border-rose-300 text-rose-600'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>{post.likes} Likes</span>
                    </button>

                    {/* Save / Bookmark Button */}
                    <button
                      onClick={() => handleToggleSave(post.id)}
                      className={`px-4 py-2 rounded-full border transition flex items-center gap-2 cursor-pointer ${
                        post.isSaved
                          ? 'bg-amber-50 border-amber-300 text-amber-700'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Bookmark className={`h-4 w-4 ${post.isSaved ? 'fill-[#F5B800] text-[#F5B800]' : ''}`} />
                      <span>{post.saves} Saved</span>
                    </button>

                    {/* Share Button */}
                    <button
                      onClick={() => handleSharePost(post)}
                      className="px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-full transition flex items-center gap-2 cursor-pointer"
                    >
                      <Share2 className="h-4 w-4 text-[#F5B800]" />
                      <span>Share</span>
                    </button>
                  </div>

                  {/* Comment Drawer Toggle */}
                  <button
                    onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                    className="px-4 py-2 bg-[#1E232A] hover:bg-black text-[#F5B800] rounded-full transition flex items-center gap-2 cursor-pointer"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>{post.comments.length} Comments</span>
                  </button>

                </div>

                {/* Comment Section Drawer */}
                {activeCommentPostId === post.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-4 bg-gray-50 rounded-2xl p-5">
                    <h5 className="font-serif font-bold text-sm text-[#1E232A] flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-[#F5B800]" />
                      Community Comments ({post.comments.length})
                    </h5>

                    {/* Existing Comments List */}
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                      {post.comments.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">Be the first to share your thoughts on this trip experience!</p>
                      ) : (
                        post.comments.map(c => (
                          <div key={c.id} className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <img src={c.avatar} alt={c.author} className="w-5 h-5 rounded-full object-cover" />
                                <span className="font-bold text-xs text-[#1E232A]">{c.author}</span>
                              </div>
                              <span className="text-[10px] text-gray-400">{c.time}</span>
                            </div>
                            <p className="text-xs text-gray-700 font-medium pl-7">{c.text}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add Comment Input */}
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        placeholder="Write a comment..."
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                        className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-full text-xs focus:outline-none focus:border-[#F5B800]"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="p-2.5 bg-[#F5B800] text-[#1E232A] rounded-full hover:bg-[#E0A600] transition cursor-pointer"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>

                  </div>
                )}

              </div>
            </div>
          ))
        )}
      </div>

      {/* Share Experience Post Modal */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto border border-gray-200">
            
            <button
              onClick={() => setIsPostModalOpen(false)}
              className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#F5B800] block">
                GlobeTrotter Community Post
              </span>
              <h3 className="text-2xl font-serif font-black text-[#1E232A]">
                Share Your Trip & Experience
              </h3>
              <p className="text-xs text-gray-500">
                Post your travel itinerary and recommendations for fellow community explorers.
              </p>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4 font-sans text-xs">
              
              {/* Select Existing Trip */}
              {userTrips.length > 0 && (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Select from Your Saved Trips (Optional):</label>
                  <select
                    value={newPostTripId}
                    onChange={(e) => handleSelectTripForPost(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-[#1E232A]"
                  >
                    <option value="">-- Or enter custom experience below --</option>
                    {userTrips.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.startDate ? String(t.startDate).slice(0, 10) : 'Custom Route'})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Trip Title */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Trip / Experience Title *</label>
                <input
                  type="text"
                  required
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  placeholder="e.g., Tokyo Temple Trails & Ramen Spots"
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold focus:border-[#F5B800]"
                />
              </div>

              {/* Destination */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Destination City / Country *</label>
                <input
                  type="text"
                  required
                  value={newPostDestination}
                  onChange={(e) => setNewPostDestination(e.target.value)}
                  placeholder="e.g., Kyoto, Japan"
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium focus:border-[#F5B800]"
                />
              </div>

              {/* Category & Rating */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Travel Category</label>
                  <select
                    value={newPostCategory}
                    onChange={(e) => setNewPostCategory(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold"
                  >
                    <option value="Culture & History">Culture & History</option>
                    <option value="Backpacking & Nature">Backpacking & Nature</option>
                    <option value="Food & Wine">Food & Wine</option>
                    <option value="Luxury">Luxury</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Your Rating (1-5 Stars)</label>
                  <select
                    value={newPostRating}
                    onChange={(e) => setNewPostRating(Number(e.target.value))}
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold"
                  >
                    <option value={5}>5.0 ⭐⭐⭐⭐⭐ (Outstanding)</option>
                    <option value={4.5}>4.5 ⭐⭐⭐⭐ (Great)</option>
                    <option value={4}>4.0 ⭐⭐⭐⭐ (Good)</option>
                  </select>
                </div>
              </div>

              {/* Experience Story Text */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Share Your Experience & Tips *</label>
                <textarea
                  required
                  rows={4}
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  placeholder="Write your story, favorite activities, best timing, or food recommendations for this trip..."
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:border-[#F5B800]"
                ></textarea>
              </div>

              {/* Cover Image URL Selection */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Cover Photo Image URL</label>
                <input
                  type="text"
                  value={newPostCover}
                  onChange={(e) => setNewPostCover(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-full cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#F5B800] hover:bg-[#E0A600] text-[#1E232A] font-extrabold uppercase tracking-widest rounded-full cursor-pointer shadow-lg"
                >
                  PUBLISH POST
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
