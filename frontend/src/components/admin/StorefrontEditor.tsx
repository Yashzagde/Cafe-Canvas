'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  getStorefrontConfigAction, 
  updateStorefrontConfigAction,
  publishStorefrontAction,
  updateTenantNameAction
} from '@/app/admin/actions/storefront.actions';
import {
  getBlogsAction,
  createBlogAction,
  updateBlogAction,
  deleteBlogAction
} from '@/app/admin/actions/blog.actions';
import { useStorefrontEditorStore } from '@/store/storefront-editor';
import { Layout, Palette, Phone, ShieldAlert, Monitor, Smartphone, Check, Sparkles, Link, Upload, Loader2, Trash2, Crop, ImageIcon, MapPin, Clock, Mail, PhoneCall, FileText, Sliders, Eye, BookOpen } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { getThemeDesign } from '@/lib/theme-designs';
import { loadTenantTheme } from '@/lib/theme-engine';

interface StoreTheme {
  id: string
  name: string
  tier: string
  colors: string[]
  description: string
  fontHeading: string
}

const PRESETS: StoreTheme[] = [
  // 1. Premium & Luxury (theme-01 to theme-03)
  {
    id: 'theme-01',
    name: 'Liquid Glass Premium',
    tier: 'Premium & Luxury',
    colors: ['#0A0A1A', '#D4AF37', '#FF6B35'],
    description: 'Frosted glassmorphism on deep navy with elegant gold and ember accents.',
    fontHeading: 'Cormorant Garamond'
  },
  {
    id: 'theme-02',
    name: 'Liquid Glass Basic',
    tier: 'Premium & Luxury',
    colors: ['#F8F9FA', '#FF6B35', '#1A1A2E'],
    description: 'Clean transparent design on light with warm orange energy.',
    fontHeading: 'Fraunces'
  },
  {
    id: 'theme-03',
    name: 'Onyx Luxury Dark',
    tier: 'Premium & Luxury',
    colors: ['#0D0D0D', '#C9A84C', '#1C1C1C'],
    description: 'Absolute black with champagne gold. Pure material darkness, chef table aesthetic.',
    fontHeading: 'Playfair Display'
  },

  // 2. Cafe & Roastery (theme-04 to theme-07)
  {
    id: 'theme-04',
    name: 'Classic Cafe Brown',
    tier: 'Cafe & Roastery',
    colors: ['#FFF3E0', '#D2691E', '#3D1C02'],
    description: 'Warm nostalgia. Kraft paper, espresso, and chocolate accents.',
    fontHeading: 'Abril Fatface'
  },
  {
    id: 'theme-05',
    name: 'Artisan Roastery',
    tier: 'Cafe & Roastery',
    colors: ['#1B1B1B', '#F97316', '#E8DCC8'],
    description: 'Dark industrial concrete walls and warm parchment coffee bags.',
    fontHeading: 'Space Grotesk'
  },
  {
    id: 'theme-06',
    name: 'Chocolate Indulgence',
    tier: 'Cafe & Roastery',
    colors: ['#3B1D0E', '#D2A679', '#E91E8C'],
    description: 'Deep chocolate luxury meets playful pink with drip details.',
    fontHeading: 'Bodoni Moda'
  },
  {
    id: 'theme-07',
    name: 'Matcha Zen',
    tier: 'Cafe & Roastery',
    colors: ['#F5F0E8', '#4A7C24', '#C8A882'],
    description: 'Wabi-sabi restraint, washi paper and matcha green accents.',
    fontHeading: 'Noto Serif JP'
  },

  // 3. Indian Regional Heritage (theme-08 to theme-13, theme-26, theme-27, theme-29, theme-30)
  {
    id: 'theme-08',
    name: 'Rajasthani Royal',
    tier: 'Indian Regional',
    colors: ['#FFF8DC', '#D4AF37', '#8B0000'],
    description: 'Rajputana palace vibes. Gold jali screens and deep maroon details.',
    fontHeading: 'Rozha One'
  },
  {
    id: 'theme-09',
    name: 'Maharashtrian Heritage',
    tier: 'Indian Regional',
    colors: ['#FFF5EE', '#FF8C00', '#006400'],
    description: 'Vibrant street energy of Maharashtra. Saffron marigold and green accents.',
    fontHeading: 'Tiro Devanagari Marathi'
  },
  {
    id: 'theme-10',
    name: 'Mughal Garden',
    tier: 'Indian Regional',
    colors: ['#F5F0E0', '#D4AF37', '#1B4332'],
    description: 'Emperor garden at dusk. Garden green, ivory, and gold arabesque.',
    fontHeading: 'Amiri'
  },
  {
    id: 'theme-11',
    name: 'Punjabi Dhaba Bold',
    tier: 'Indian Regional',
    colors: ['#FFFACD', '#FF4500', '#FFD700'],
    description: 'Grand Trunk Road energy. Bold truck-art orange-red and yellow colors.',
    fontHeading: 'Baloo Paaji 2'
  },
  {
    id: 'theme-12',
    name: 'South Indian Temple',
    tier: 'Indian Regional',
    colors: ['#FFFDD0', '#8B0000', '#B8860B'],
    description: 'Sandalwood cream and temple vermillion red with gold highlights.',
    fontHeading: 'Noto Serif Tamil'
  },
  {
    id: 'theme-13',
    name: 'Gujarat Mithai Gold',
    tier: 'Indian Regional',
    colors: ['#FFFAF0', '#FF8C00', '#FFD700'],
    description: 'Navratri and Diwali celebration. Festive orange and sweet yellow colors.',
    fontHeading: 'Noto Serif Gujarati'
  },


  // 4. Global Cuisines (theme-14 to theme-25, theme-28)
  {
    id: 'theme-14',
    name: 'Kashmiri Winter',
    tier: 'Global Cuisines',
    colors: ['#F5F5F5', '#1E3A5F', '#DAA520'],
    description: 'Snow and saffron. Deep blue Kashmiri winter sky and silver details.',
    fontHeading: 'Noto Nastaliq Urdu'
  },
  {
    id: 'theme-15',
    name: 'Italian Trattoria',
    tier: 'Global Cuisines',
    colors: ['#F5F0DC', '#CE2B37', '#009246'],
    description: 'Napoli parchment and Italian tricolore. Olive and dried tomato colors.',
    fontHeading: 'Playfair Display'
  },
  {
    id: 'theme-16',
    name: 'Chinese Dynasty Red',
    tier: 'Global Cuisines',
    colors: ['#FFF8DC', '#DC143C', '#FFD700'],
    description: 'Imperial palace dining. Crimson red, dragon clouds, and gold accents.',
    fontHeading: 'Noto Serif SC'
  },
  {
    id: 'theme-17',
    name: 'Japanese Sakura',
    tier: 'Global Cuisines',
    colors: ['#F5F0E0', '#FFB7C5', '#1C1C1C'],
    description: 'Cherry blossom season. Washi paper background and sakura pink accents.',
    fontHeading: 'Noto Serif JP'
  },
  {
    id: 'theme-18',
    name: 'Mediterranean Blue',
    tier: 'Global Cuisines',
    colors: ['#FFFFFF', '#1E90FF', '#F5DEB3'],
    description: 'Santorini whitewash and Aegean blue with sun-drenched meander patterns.',
    fontHeading: 'Philosopher'
  },
  {
    id: 'theme-19',
    name: 'Mexican Fiesta',
    tier: 'Global Cuisines',
    colors: ['#FFFACD', '#FF0000', '#FFD700'],
    description: 'Papel picado and street taco energy. Loud red and vibrant yellow.',
    fontHeading: 'Pacifico'
  },
  {
    id: 'theme-20',
    name: 'Thai Tropical',
    tier: 'Global Cuisines',
    colors: ['#FAFFFE', '#006400', '#FFD700'],
    description: 'Lemongrass and tropical leaves. Deep forest green and gold details.',
    fontHeading: 'Mitr'
  },
  {
    id: 'theme-21',
    name: 'American Diner Chrome',
    tier: 'Global Cuisines',
    colors: ['#1C1C1C', '#FF0000', '#C0C0C0'],
    description: 'Checkerboard tiles, retro red neon lights, and chrome metal accents.',
    fontHeading: 'Bebas Neue'
  },
  {
    id: 'theme-22',
    name: 'Korean Bento',
    tier: 'Global Cuisines',
    colors: ['#FFFFFF', '#E8002D', '#003478'],
    description: 'Taegukgi flag-inspired palette of bold red, navy, and hanji paper beige.',
    fontHeading: 'Noto Sans KR'
  },
  {
    id: 'theme-23',
    name: 'French Patisserie',
    tier: 'Global Cuisines',
    colors: ['#F9F5F0', '#8E3A7D', '#D4A873'],
    description: 'Parisian macaron display. Dusty mauve, gold leaf, and crème patissière elegance.',
    fontHeading: 'Cormorant Garamond'
  },
  {
    id: 'theme-24',
    name: 'Middle Eastern Souk',
    tier: 'Global Cuisines',
    colors: ['#F5EDE0', '#B8860B', '#1A3C34'],
    description: 'Spice market at golden hour. Saffron amber, deep cedar green, and hammered brass.',
    fontHeading: 'Amiri'
  },
  {
    id: 'theme-25',
    name: 'Spanish Tapas',
    tier: 'Global Cuisines',
    colors: ['#FFF8F0', '#C0392B', '#F4A460'],
    description: 'Terracotta warmth and sangria red. Flamenco energy meets Andalusian sunsets.',
    fontHeading: 'Bodoni Moda'
  },
  {
    id: 'theme-26',
    name: 'Bengali Fish Curry',
    tier: 'Indian Regional',
    colors: ['#FFF9F0', '#D4930A', '#1A4B8C'],
    description: 'Mustard yellow and monsoon-blue clay. Kolkata lane-food energy on terracotta plates.',
    fontHeading: 'Tiro Devanagari Marathi'
  },
  {
    id: 'theme-27',
    name: 'Kerala Backwater',
    tier: 'Indian Regional',
    colors: ['#F0FDF4', '#0D6B3A', '#8B5E3C'],
    description: 'Houseboat at dawn. Coconut palm green, teakwood brown, and backwater mist.',
    fontHeading: 'Noto Serif Malayalam'
  },
  {
    id: 'theme-28',
    name: 'Goan Beach Shack',
    tier: 'Global Cuisines',
    colors: ['#F0FFFE', '#0E8A7D', '#E8A317'],
    description: 'Sun-bleached shoreline vibes. Teal sea, amber sunlight, and barefoot dining.',
    fontHeading: 'Pacifico'
  },
  {
    id: 'theme-29',
    name: 'Chettinad Spice',
    tier: 'Indian Regional',
    colors: ['#FAF0E6', '#8B2500', '#3E1607'],
    description: 'Athangudi tiles and pepper vine darkness. Deep terracotta and Karaikudi heritage.',
    fontHeading: 'Noto Serif Tamil'
  },
  {
    id: 'theme-30',
    name: 'Hyderabadi Nawabi',
    tier: 'Indian Regional',
    colors: ['#FAF5FF', '#6B21A8', '#C9A84C'],
    description: 'Charminar dusk. Royal purple, champagne gold, and Nizami pearl accents.',
    fontHeading: 'Amiri'
  },

  // 5. Modern & Trendy (theme-31 to theme-35)
  {
    id: 'theme-31',
    name: 'Neon Street Food',
    tier: 'Modern & Trendy',
    colors: ['#0A0A14', '#EC4899', '#06D6A0'],
    description: 'Cyberpunk midnight bazaar. Hot neon pink, electric mint, and holographic overlays.',
    fontHeading: 'Space Grotesk'
  },
  {
    id: 'theme-32',
    name: 'Y2K Retro Pop',
    tier: 'Modern & Trendy',
    colors: ['#FFF0F5', '#F43F5E', '#00B4D8'],
    description: 'Bubblegum millennium nostalgia. Chrome accents, glossy rose, and electric ocean.',
    fontHeading: 'Outfit'
  },
  {
    id: 'theme-33',
    name: 'Botanical Garden',
    tier: 'Modern & Trendy',
    colors: ['#F0FDF4', '#166534', '#2D5016'],
    description: 'Living wall conservatory. Deep emerald, moss shadow, and pressed-fern textures.',
    fontHeading: 'Fraunces'
  },
  {
    id: 'theme-34',
    name: 'Industrial Craft',
    tier: 'Modern & Trendy',
    colors: ['#F0F2F5', '#64748B', '#E85D04'],
    description: 'Exposed brick and steel girders. Concrete grey, ember orange, and craft typography.',
    fontHeading: 'Space Grotesk'
  },
  {
    id: 'theme-35',
    name: 'Pastels Kawaii',
    tier: 'Modern & Trendy',
    colors: ['#FFF5F7', '#FF6B9D', '#7DD3FC'],
    description: 'Soft-serve dreamscape. Cotton candy rose, baby blue, and marshmallow rounded forms.',
    fontHeading: 'Poppins'
  },

  // 6. Seasonal & Festive (theme-37 to theme-43)
  {
    id: 'theme-37',
    name: 'Diwali Glow',
    tier: 'Seasonal & Festive',
    colors: ['#FFFCEB', '#D4930A', '#8B2500'],
    description: 'Festival of lights. Deep diya amber, rangoli vermillion, and sparkler gold halos.',
    fontHeading: 'Rozha One'
  },
  {
    id: 'theme-38',
    name: 'Holi Splash',
    tier: 'Seasonal & Festive',
    colors: ['#FEFAFF', '#D946EF', '#F59E0B'],
    description: 'Gulal explosion. Magenta, turmeric yellow, and peacock teal color-burst energy.',
    fontHeading: 'Baloo Paaji 2'
  },
  {
    id: 'theme-39',
    name: 'Christmas Cosy',
    tier: 'Seasonal & Festive',
    colors: ['#FDFBFB', '#166534', '#B91C1C'],
    description: 'Fireside warmth. Pine needle green, cranberry red, and cinnamon stick accents.',
    fontHeading: 'Playfair Display'
  },
  {
    id: 'theme-40',
    name: 'Eid Crescent',
    tier: 'Seasonal & Festive',
    colors: ['#F5FBF7', '#047857', '#C9A84C'],
    description: 'Moonlit feast. Emerald green, crescent gold, and arabesque lantern patterns.',
    fontHeading: 'Amiri'
  },
  {
    id: 'theme-41',
    name: 'Monsoon Cafe',
    tier: 'Seasonal & Festive',
    colors: ['#EFF3F8', '#475569', '#2563EB'],
    description: 'Petrichor season. Raincloud slate, electric puddle-splash blue, and misted glass.',
    fontHeading: 'Nunito'
  },
  {
    id: 'theme-42',
    name: 'Summer Burst',
    tier: 'Seasonal & Festive',
    colors: ['#FFFBEB', '#EA580C', '#F59E0B'],
    description: 'Mango-season energy. Citrus orange, lemonade yellow, and sugarcane green details.',
    fontHeading: 'Bebas Neue'
  },
  {
    id: 'theme-43',
    name: 'Valentine Blush',
    tier: 'Seasonal & Festive',
    colors: ['#FFF5F5', '#9F1239', '#FDA4AF'],
    description: 'Rose-petal romance. Deep burgundy, blush pink, and champagne-fizz sparkle.',
    fontHeading: 'Cormorant Garamond'
  },

  // 7. Specialized Displays (theme-36, theme-44 to theme-52)
  {
    id: 'theme-36',
    name: 'Bakehouse Warm',
    tier: 'Specialized Displays',
    colors: ['#FBF7F4', '#C4714A', '#A13670'],
    description: 'Fresh-from-the-oven glow. Sourdough crust brown, berry jam, and floury surfaces.',
    fontHeading: 'Fraunces'
  },
  {
    id: 'theme-44',
    name: 'New Year Noir',
    tier: 'Specialized Displays',
    colors: ['#080808', '#D4AF37', '#1C1C1C'],
    description: 'Midnight countdown. Jet black, champagne gold confetti, and obsidian glass surfaces.',
    fontHeading: 'Playfair Display'
  },
  {
    id: 'theme-45',
    name: 'Dark Mode Espresso',
    tier: 'Specialized Displays',
    colors: ['#121212', '#EADCC8', '#5C3310'],
    description: 'Late-night caffeine. Pure OLED black, parchment cream, and fresh-pull espresso brown.',
    fontHeading: 'Outfit'
  },
  {
    id: 'theme-46',
    name: 'High Contrast',
    tier: 'Specialized Displays',
    colors: ['#FFFFFF', '#000000', '#0000EE'],
    description: 'WCAG AAA accessibility mode. Maximum black-on-white contrast with blue action links.',
    fontHeading: 'Inter'
  },
  {
    id: 'theme-47',
    name: 'Print-Ready Menu',
    tier: 'Specialized Displays',
    colors: ['#FFFFFF', '#1A1A1A', '#6B7280'],
    description: 'Paper-optimized monochrome. Ink-black text, subtle grey dividers, zero color waste.',
    fontHeading: 'Inter'
  },
  {
    id: 'theme-48',
    name: 'Kiosk Display',
    tier: 'Specialized Displays',
    colors: ['#F8FAFC', '#0F172A', '#2563EB'],
    description: 'Touch-screen first. Large 48px tap targets, high contrast navy, and action blue CTAs.',
    fontHeading: 'Space Grotesk'
  },
  {
    id: 'theme-49',
    name: 'Delivery-First',
    tier: 'Specialized Displays',
    colors: ['#FFF7F3', '#EA580C', '#1E293B'],
    description: 'Swiggy/Zomato energy. Urgent orange, rapid-scroll layout, and one-tap basket flow.',
    fontHeading: 'Outfit'
  },
  {
    id: 'theme-50',
    name: 'Catering Corporate',
    tier: 'Specialized Displays',
    colors: ['#F8FAFC', '#1E3A8A', '#64748B'],
    description: 'Board-room professional. Executive navy, polished slate, and quarterly-report precision.',
    fontHeading: 'Inter'
  },
  {
    id: 'theme-51',
    name: 'Wedding & Events',
    tier: 'Specialized Displays',
    colors: ['#FFFBFA', '#C29F6F', '#D4A0A0'],
    description: 'Mandap & marquee. Champagne gold, blush rose, and heirloom lace textures.',
    fontHeading: 'Cormorant Garamond'
  },
  {
    id: 'theme-52',
    name: 'Kids & Family',
    tier: 'Specialized Displays',
    colors: ['#FFFEF5', '#EC4899', '#3B82F6'],
    description: 'Crayon-bright playground. Bubblegum pink, sky blue, and hand-drawn doodle borders.',
    fontHeading: 'Poppins'
  }
];

export default function StorefrontEditor({ 
  tenantPublicId, 
  tenantPrivateId,
  tenantName,
  setTenantName,
  tenantLogoUrl,
  tenantSlug
}: { 
  tenantPublicId: string; 
  tenantPrivateId: string;
  tenantName: string;
  setTenantName: React.Dispatch<React.SetStateAction<string>>;
  tenantLogoUrl?: string | null;
  tenantSlug?: string;
}) {
  const { config, setConfig, updateField, isDirty, clearDirty } = useStorefrontEditorStore();
  const [activeTab, setActiveTab] = useState<'branding' | 'hero' | 'layout' | 'blogs' | 'social' | 'connection' | 'footer'>('branding');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('mobile');
  const [previewSlide, setPreviewSlide] = useState<1 | 2 | 3>(1);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [storeName, setStoreName] = useState(tenantName);
  const [isNameDirty, setIsNameDirty] = useState(false);
  const [localIp, setLocalIp] = useState('localhost');

  useEffect(() => {
    fetch('/api/local-ip')
      .then(res => res.json())
      .then(data => {
        if (data.localIp) {
          setLocalIp(data.localIp);
        }
      })
      .catch(err => console.error('Error fetching local IP:', err));
  }, []);

  const supabase = createClient();
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  // Blogs CRUD states
  const [blogsList, setBlogsList] = useState<any[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any | null>(null);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogExcerpt, setBlogExcerpt] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogAuthor, setBlogAuthor] = useState('');
  const [blogTags, setBlogTags] = useState('');
  const [blogImageUrl, setBlogImageUrl] = useState('');
  const [savingBlog, setSavingBlog] = useState(false);
  const [deletingBlogId, setDeletingBlogId] = useState<string | null>(null);

  const loadBlogs = useCallback(async () => {
    setLoadingBlogs(true);
    try {
      const data = await getBlogsAction();
      setBlogsList(data);
    } catch (err) {
      console.error('Failed to load blogs:', err);
    } finally {
      setLoadingBlogs(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'blogs') {
      loadBlogs();
    }
  }, [activeTab, loadBlogs]);

  const startEditingBlog = (blog: any) => {
    setEditingBlog(blog);
    if (blog === 'new') {
      setBlogTitle('');
      setBlogExcerpt('');
      setBlogContent('');
      setBlogAuthor('Chef Barista');
      setBlogTags('');
      setBlogImageUrl('');
    } else if (blog) {
      setBlogTitle(blog.title || '');
      setBlogExcerpt(blog.excerpt || '');
      setBlogContent(blog.content || '');
      setBlogAuthor(blog.author || '');
      setBlogTags(blog.tags ? blog.tags.join(', ') : '');
      setBlogImageUrl(blog.image_url || '');
    }
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTitle.trim() || !blogExcerpt.trim() || !blogContent.trim()) {
      alert('Title, excerpt, and content are required.');
      return;
    }
    setSavingBlog(true);
    try {
      const tagsArray = blogTags.split(',').map(t => t.trim()).filter(Boolean);
      const payload = {
        title: blogTitle,
        excerpt: blogExcerpt,
        content: blogContent,
        author: blogAuthor || 'Chef Barista',
        tags: tagsArray,
        image_url: blogImageUrl || null,
        published_at: new Date().toISOString()
      };

      if (editingBlog === 'new') {
        const created = await createBlogAction(payload);
        if (created) {
          alert('🎉 Blog post created successfully!');
        }
      } else if (editingBlog && editingBlog.id) {
        const updated = await updateBlogAction(editingBlog.id, payload);
        if (updated) {
          alert('🎉 Blog post updated successfully!');
        }
      }
      setEditingBlog(null);
      loadBlogs();
    } catch (err: any) {
      console.error('Failed to save blog:', err);
      alert(err.message || 'Failed to save blog post.');
    } finally {
      setSavingBlog(false);
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    setDeletingBlogId(id);
    try {
      await deleteBlogAction(id);
      alert('Blog post deleted successfully.');
      loadBlogs();
    } catch (err: any) {
      console.error('Failed to delete blog:', err);
      alert(err.message || 'Failed to delete blog post.');
    } finally {
      setDeletingBlogId(null);
    }
  };

  const handleUploadBlogImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField('blog_image');
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `blog-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      setBlogImageUrl(publicUrl);
      alert('🎉 Cover image uploaded successfully!');
    } catch (err: any) {
      console.error('Upload error:', err);
      alert('Upload failed: ' + err.message);
    } finally {
      setUploadingField(null);
    }
  };

  const themeDesign = useMemo(() => {
    return getThemeDesign(config?.theme_id || 'theme-02');
  }, [config?.theme_id]);

  useEffect(() => {
    if (config?.theme_id) {
      loadTenantTheme(config.theme_id).catch(console.error);
    }
  }, [config?.theme_id]);

  // Logo crop state
  const [logoCropSrc, setLogoCropSrc] = useState<string | null>(null);
  const [logoCropOpen, setLogoCropOpen] = useState(false);
  const [cropPos, setCropPos] = useState({ x: 0, y: 0 });
  const [cropSize, setCropSize] = useState(120);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const cropCanvasRef = useRef<HTMLCanvasElement>(null);
  const cropImgRef = useRef<HTMLImageElement>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [naturalImgSize, setNaturalImgSize] = useState({ w: 0, h: 0 });
  const [displayImgSize, setDisplayImgSize] = useState({ w: 0, h: 0 });

  const handleUploadImageForField = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'hero_image_url' | 'hero_image_url_2' | 'hero_image_url_3' | 'logo_url' | 'about_image_url') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(fieldName);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `hero-${fieldName}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      updateField(fieldName, publicUrl);
      alert('🎉 Image uploaded successfully!');
    } catch (err: any) {
      console.error('Upload error:', err);
      alert('Upload failed: ' + err.message);
    } finally {
      setUploadingField(null);
    }
  };

  const handleRemoveImageForField = (fieldName: 'hero_image_url' | 'hero_image_url_2' | 'hero_image_url_3' | 'logo_url' | 'about_image_url') => {
    updateField(fieldName, '');
  };

  // Logo file picker → opens crop modal
  const handleLogoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setLogoCropSrc(reader.result as string);
      setCropPos({ x: 20, y: 20 });
      setCropSize(120);
      setLogoCropOpen(true);
    };
    reader.readAsDataURL(file);
    // Reset the input so the same file can be re-selected
    e.target.value = '';
  };

  // When the crop image loads, record its natural and display dimensions
  const handleCropImgLoad = () => {
    const img = cropImgRef.current;
    if (!img) return;
    setNaturalImgSize({ w: img.naturalWidth, h: img.naturalHeight });
    setDisplayImgSize({ w: img.clientWidth, h: img.clientHeight });
    // Center the crop rect
    const s = Math.min(120, img.clientWidth - 20, img.clientHeight - 20);
    setCropSize(s);
    setCropPos({ x: (img.clientWidth - s) / 2, y: (img.clientHeight - s) / 2 });
  };

  // Crop mouse events
  const handleCropMouseDown = (e: React.MouseEvent, mode: 'drag' | 'resize') => {
    e.preventDefault();
    e.stopPropagation();
    if (mode === 'drag') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - cropPos.x, y: e.clientY - cropPos.y });
    } else {
      setIsResizing(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleCropMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cropImgRef.current) return;
    const imgW = cropImgRef.current.clientWidth;
    const imgH = cropImgRef.current.clientHeight;

    if (isDragging) {
      let nx = e.clientX - dragStart.x;
      let ny = e.clientY - dragStart.y;
      nx = Math.max(0, Math.min(nx, imgW - cropSize));
      ny = Math.max(0, Math.min(ny, imgH - cropSize));
      setCropPos({ x: nx, y: ny });
    } else if (isResizing) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      const delta = Math.max(dx, dy);
      const newSize = Math.max(40, Math.min(cropSize + delta, imgW - cropPos.x, imgH - cropPos.y));
      setCropSize(newSize);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }, [isDragging, isResizing, dragStart, cropSize, cropPos]);

  const handleCropMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  // Apply crop and upload
  const handleApplyCrop = async () => {
    if (!logoCropSrc || !cropImgRef.current) return;
    setUploadingLogo(true);
    try {
      const img = cropImgRef.current;
      const scaleX = img.naturalWidth / img.clientWidth;
      const scaleY = img.naturalHeight / img.clientHeight;

      const sx = cropPos.x * scaleX;
      const sy = cropPos.y * scaleY;
      const sw = cropSize * scaleX;
      const sh = cropSize * scaleY;

      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d')!;

      const srcImg = new window.Image();
      srcImg.crossOrigin = 'anonymous';
      srcImg.src = logoCropSrc;
      await new Promise<void>((resolve) => { srcImg.onload = () => resolve(); if (srcImg.complete) resolve(); });

      ctx.drawImage(srcImg, sx, sy, sw, sh, 0, 0, 256, 256);

      const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
      const filePath = `logo-${Date.now()}.png`;
      const { error } = await supabase.storage.from('logos').upload(filePath, blob, { cacheControl: '3600', upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(filePath);
      updateField('logo_url', publicUrl);
      setLogoCropOpen(false);
      setLogoCropSrc(null);
      alert('🎉 Logo uploaded and cropped successfully!');
    } catch (err: any) {
      console.error('Logo crop error:', err);
      alert('Logo upload failed: ' + err.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  useEffect(() => {
    setStoreName(tenantName);
  }, [tenantName]);

  const [themeCategory, setThemeCategory] = useState<string>('All');
  const categories = [
    'All',
    'Premium & Luxury',
    'Cafe & Roastery',
    'Indian Regional',
    'Global Cuisines',
    'Modern & Trendy',
    'Seasonal & Festive',
    'Specialized Displays'
  ];

  const loadConfig = async () => {
    try {
      const data = await getStorefrontConfigAction();
      if (data) {
        setConfig(data);
      }
    } catch (err) {
      console.error('Failed to load storefront configuration:', err);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      if (isNameDirty) {
        const tenantUpdated = await updateTenantNameAction(storeName);
        if (tenantUpdated) {
          setTenantName(storeName);
          setIsNameDirty(false);
        }
      }
      const updated = await updateStorefrontConfigAction(config.id, config);
      if (updated) {
        setConfig(updated);
        clearDirty();
      }
    } catch (err: any) {
      console.error('Failed to save storefront configuration:', err);
      alert(err.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!config) return;
    setPublishing(true);
    try {
      // Save any pending changes first
      if (isDirty || isNameDirty) {
        if (isNameDirty) {
          const tenantUpdated = await updateTenantNameAction(storeName);
          if (tenantUpdated) {
            setTenantName(storeName);
            setIsNameDirty(false);
          }
        }
        const updated = await updateStorefrontConfigAction(config.id, config);
        if (updated) {
          setConfig(updated);
          clearDirty();
        }
      }
      const publishRes = await publishStorefrontAction('Published via Storefront Experience Editor');
      if (publishRes) {
        alert('🚀 Storefront changes published and live!');
      }
    } catch (err: any) {
      console.error('Failed to publish changes:', err);
      alert(err.message || 'Failed to publish changes');
    } finally {
      setPublishing(false);
    }
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    updateField('theme_id', preset.id);
    updateField('primary_color', preset.colors[0]);
    updateField('accent_color', preset.colors[1] || preset.colors[0]);
    updateField('font_heading', preset.fontHeading);
    updateField('theme_preset', preset.name);
  };

  if (!config) {
    return (
      <div className="py-8 text-center text-[#1e293b]/40">
        <span className="inline-block w-6 h-6 border-2 border-[#d97706] border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  return (<>
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 text-[#1e293b] animate-fade-in">
      {/* Settings Form */}
      <div className="space-y-6 bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-6 shadow-xl h-fit">
        <div className="flex items-center justify-between border-b border-[#e2e8f0]/50 pb-4">
          <div>
            <h2 className="text-lg font-extrabold font-display">Storefront Experience Editor</h2>
            <p className="text-xs text-[#1e293b]/50">Modify client site themes, branding, and layouts.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={(!isDirty && !isNameDirty) || saving || publishing}
              className="px-4 py-2 bg-[#f1f5f9] text-[#1e293b]/70 hover:text-[#1e293b] hover:bg-[#e2e8f0] font-extrabold rounded-2xl text-xs transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none border border-[#e2e8f0]"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
            <button
              onClick={handlePublish}
              disabled={saving || publishing}
              className="px-4 py-2 bg-gradient-to-r from-[#16a34a] to-[#10b981] hover:opacity-95 text-white font-extrabold rounded-2xl text-xs transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
            >
              {publishing ? 'Publishing...' : 'Publish Changes'}
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-[#e2e8f0]/30 pb-2">
          <button
            onClick={() => setActiveTab('branding')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'branding' ? 'bg-[#f1f5f9] text-[#d97706]' : 'text-[#1e293b]/50 hover:text-[#1e293b]'
            }`}
          >
            <Palette size={14} />
            <span>Theme & Colors</span>
          </button>
          <button
            onClick={() => setActiveTab('hero')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'hero' ? 'bg-[#f1f5f9] text-[#d97706]' : 'text-[#1e293b]/50 hover:text-[#1e293b]'
            }`}
          >
            <Layout size={14} />
            <span>Hero Header</span>
          </button>
          <button
            onClick={() => setActiveTab('layout')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'layout' ? 'bg-[#f1f5f9] text-[#d97706]' : 'text-[#1e293b]/50 hover:text-[#1e293b]'
            }`}
          >
            <Sliders size={14} />
            <span>Visibility & Features</span>
          </button>
          <button
            onClick={() => setActiveTab('blogs')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'blogs' ? 'bg-[#f1f5f9] text-[#d97706]' : 'text-[#1e293b]/50 hover:text-[#1e293b]'
            }`}
          >
            <BookOpen size={14} />
            <span>Manage Blogs</span>
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'social' ? 'bg-[#f1f5f9] text-[#d97706]' : 'text-[#1e293b]/50 hover:text-[#1e293b]'
            }`}
          >
            <Phone size={14} />
            <span>Integrations</span>
          </button>
          <button
            onClick={() => setActiveTab('connection')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'connection' ? 'bg-[#f1f5f9] text-[#d97706]' : 'text-[#1e293b]/50 hover:text-[#1e293b]'
            }`}
          >
            <Link size={14} />
            <span>Storefront Link</span>
          </button>
          <button
            onClick={() => setActiveTab('footer')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'footer' ? 'bg-[#f1f5f9] text-[#d97706]' : 'text-[#1e293b]/50 hover:text-[#1e293b]'
            }`}
          >
            <FileText size={14} />
            <span>Footer Info</span>
          </button>
        </div>

        {/* Edit fields based on active tab */}
        <div className="space-y-5">
          {activeTab === 'branding' && (
            <>
              {/* Storefront Business Name */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1e293b]/70 tracking-wider uppercase block">
                  Storefront Business Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chai Point"
                  value={storeName}
                  onChange={(e) => {
                    setStoreName(e.target.value);
                    setIsNameDirty(true);
                  }}
                  className="w-full px-4 py-3 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl text-sm font-bold text-[#1e293b] focus:outline-none focus:border-[#d97706]"
                />
              </div>

              {/* Presets Grid */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-[#1e293b]/70 tracking-wider uppercase block">
                  Quick Design Presets
                </label>
                
                {/* Category Filter Pills */}
                <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2 border-b border-[#e2e8f0]/40 scrollbar-none">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setThemeCategory(category)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all border ${
                        themeCategory === category
                          ? 'bg-[#d97706] text-[#ffffff] border-[#d97706] shadow-sm'
                          : 'bg-[#f1f5f9] text-[#1e293b]/60 border-[#e2e8f0] hover:border-[#d97706]/40 hover:bg-[#FAF6F0]'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[280px] overflow-y-auto pr-1">
                  {PRESETS.filter(
                    (p) => themeCategory === 'All' || p.tier === themeCategory
                  ).map((p) => {
                    const isSelected = config.theme_id === p.id || config.theme_preset === p.name;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => applyPreset(p)}
                        className={`p-3 bg-[#f1f5f9] border rounded-2xl flex flex-col gap-2 items-start text-left cursor-pointer transition-all ${
                          isSelected ? 'border-[#d97706] bg-[#d97706]/5' : 'border-[#e2e8f0] hover:border-[#e2e8f0]/80'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 w-full">
                          <div className="w-3.5 h-3.5 rounded-full border border-black/5" style={{ backgroundColor: p.colors[0] }} title={p.colors[0]}></div>
                          <div className="w-3.5 h-3.5 rounded-full border border-black/5" style={{ backgroundColor: p.colors[1] || p.colors[0] }} title={p.colors[1]}></div>
                          {isSelected && <Check size={10} className="text-[#d97706] ml-auto" />}
                        </div>
                        <span className="text-[10px] font-extrabold tracking-wide uppercase text-[#1e293b]/70 truncate w-full">
                          {p.name}
                        </span>
                        <span className="text-[8px] font-bold text-[#1e293b]/40 uppercase tracking-wider block">
                          {p.id}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Specific Swatches */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#1e293b]/70 tracking-wider uppercase block">
                    Primary Brand Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={config.primary_color}
                      onChange={(e) => updateField('primary_color', e.target.value)}
                      className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer overflow-hidden"
                    />
                    <input
                      type="text"
                      value={config.primary_color}
                      onChange={(e) => updateField('primary_color', e.target.value)}
                      className="flex-1 px-4 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:border-[#d97706] uppercase text-mono"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#1e293b]/70 tracking-wider uppercase block">
                    Accent/Background Dark
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={config.accent_color}
                      onChange={(e) => updateField('accent_color', e.target.value)}
                      className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer overflow-hidden"
                    />
                    <input
                      type="text"
                      value={config.accent_color}
                      onChange={(e) => updateField('accent_color', e.target.value)}
                      className="flex-1 px-4 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:border-[#d97706] uppercase text-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Fonts selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#1e293b]/70 tracking-wider uppercase block">
                    Heading Typography
                  </label>
                  <select
                    value={config.font_heading}
                    onChange={(e) => updateField('font_heading', e.target.value)}
                    className="w-full px-4 py-3 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:border-[#d97706]"
                  >
                    <option value="Outfit">Outfit</option>
                    <option value="Playfair Display">Playfair Display</option>
                    <option value="Inter">Inter</option>
                    <option value="Nunito">Nunito</option>
                    <option value="Poppins">Poppins</option>
                    <option value="Cormorant Garamond">Cormorant Garamond</option>
                    <option value="Fraunces">Fraunces</option>
                    <option value="Space Grotesk">Space Grotesk</option>
                    <option value="Abril Fatface">Abril Fatface</option>
                    <option value="Bodoni Moda">Bodoni Moda</option>
                    <option value="Noto Serif JP">Noto Serif JP</option>
                    <option value="Rozha One">Rozha One</option>
                    <option value="Tiro Devanagari Marathi">Tiro Devanagari Marathi</option>
                    <option value="Amiri">Amiri</option>
                    <option value="Baloo Paaji 2">Baloo Paaji 2</option>
                    <option value="Noto Serif Tamil">Noto Serif Tamil</option>
                    <option value="Noto Serif Malayalam">Noto Serif Malayalam</option>
                    <option value="Noto Serif Gujarati">Noto Serif Gujarati</option>
                    <option value="Noto Nastaliq Urdu">Noto Nastaliq Urdu</option>
                    <option value="Noto Serif SC">Noto Serif SC</option>
                    <option value="Philosopher">Philosopher</option>
                    <option value="Pacifico">Pacifico</option>
                    <option value="Mitr">Mitr</option>
                    <option value="Bebas Neue">Bebas Neue</option>
                    <option value="Noto Sans KR">Noto Sans KR</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#1e293b]/70 tracking-wider uppercase block">
                    Body Text Typography
                  </label>
                  <select
                    value={config.font_body}
                    onChange={(e) => updateField('font_body', e.target.value)}
                    className="w-full px-4 py-3 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:border-[#d97706]"
                  >
                    <option value="Inter">Inter (Recommended)</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Outfit">Outfit</option>
                    <option value="Open Sans">Open Sans</option>
                  </select>
                </div>
              </div>


            </>
          )}

          {activeTab === 'hero' && (
            <>
              {/* SLIDE 1 SECTION */}
              <div className="space-y-4 p-4 rounded-2xl bg-amber-500/[0.03] border border-amber-500/10">
                <span className="text-[10px] font-black text-[#d97706] tracking-widest uppercase block">
                  Slide 1 - Welcome Header
                </span>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#1e293b]/70 tracking-wider uppercase block">
                    Welcome Title
                  </label>
                  <input
                    type="text"
                    value={config.hero_title || 'Indulge in Artful Brews'}
                    onChange={(e) => { updateField('hero_title', e.target.value); setPreviewSlide(1); }}
                    onFocus={() => setPreviewSlide(1)}
                    className="w-full px-4 py-3 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:border-[#d97706]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#1e293b]/70 tracking-wider uppercase block">
                    Welcome Subtitle
                  </label>
                  <textarea
                    value={config.hero_subtitle || 'Taste the single-origin specialty blends crafted by master baristas.'}
                    onChange={(e) => { updateField('hero_subtitle', e.target.value); setPreviewSlide(1); }}
                    onFocus={() => setPreviewSlide(1)}
                    rows={2}
                    className="w-full px-4 py-3 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:border-[#d97706]"
                  />
                </div>

                {/* Hero Background Image Slide 1 */}
                <div className="space-y-2 pt-2 border-t border-[#e2e8f0]/40">
                  <label className="text-[10px] font-bold text-[#1e293b]/70 tracking-wider uppercase block">
                    Slide 1 Background Image
                  </label>
                  
                  {config.hero_image_url ? (
                    <div className="p-3 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#e2e8f0] shrink-0 bg-stone-100 flex items-center justify-center">
                        <img src={config.hero_image_url} alt="Hero Slide 1 Preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-[10px] font-bold text-[#1e293b]/80 truncate max-w-[200px]">
                          {config.hero_image_url.split('/').pop()}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleRemoveImageForField('hero_image_url')}
                          className="text-[9px] font-extrabold text-red-650 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 size={10} />
                          Remove Image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative border-2 border-dashed border-[#e2e8f0] hover:border-[#d97706]/40 rounded-xl p-4 text-center transition-all bg-[#fdfcf7] hover:bg-[#FAF6F0]">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => { handleUploadImageForField(e, 'hero_image_url'); setPreviewSlide(1); }}
                        disabled={uploadingField !== null}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      />
                      <div className="space-y-2 flex flex-col items-center justify-center">
                        {uploadingField === 'hero_image_url' ? (
                          <>
                            <Loader2 className="w-6 h-6 text-[#d97706] animate-spin" />
                            <p className="text-[10px] font-bold text-[#1e293b]/70">Uploading to Supabase...</p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-[#1e293b]/30" />
                            <div>
                              <p className="text-[10px] font-bold text-[#1e293b]/70">Click or drag image to upload</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SLIDE 2 SECTION */}
              <div className="space-y-4 p-4 rounded-2xl bg-amber-500/[0.03] border border-amber-500/10">
                <span className="text-[10px] font-black text-[#d97706] tracking-widest uppercase block">
                  Slide 2 - Specialities
                </span>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#1e293b]/70 tracking-wider uppercase block">
                    Specialities Title
                  </label>
                  <input
                    type="text"
                    value={config.hero_title_2 || "Our Barista's Masterpieces"}
                    onChange={(e) => { updateField('hero_title_2', e.target.value); setPreviewSlide(2); }}
                    onFocus={() => setPreviewSlide(2)}
                    className="w-full px-4 py-3 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:border-[#d97706]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#1e293b]/70 tracking-wider uppercase block">
                    Specialities Subtitle
                  </label>
                  <textarea
                    value={config.hero_subtitle_2 || 'Every cup is a canvas. Discover our premium organic blends and slow pour-overs.'}
                    onChange={(e) => { updateField('hero_subtitle_2', e.target.value); setPreviewSlide(2); }}
                    onFocus={() => setPreviewSlide(2)}
                    rows={2}
                    className="w-full px-4 py-3 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:border-[#d97706]"
                  />
                </div>

                {/* Hero Background Image Slide 2 */}
                <div className="space-y-2 pt-2 border-t border-[#e2e8f0]/40">
                  <label className="text-[10px] font-bold text-[#1e293b]/70 tracking-wider uppercase block">
                    Slide 2 Background Image
                  </label>
                  
                  {config.hero_image_url_2 ? (
                    <div className="p-3 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#e2e8f0] shrink-0 bg-stone-100 flex items-center justify-center">
                        <img src={config.hero_image_url_2} alt="Hero Slide 2 Preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-[10px] font-bold text-[#1e293b]/80 truncate max-w-[200px]">
                          {config.hero_image_url_2.split('/').pop()}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleRemoveImageForField('hero_image_url_2')}
                          className="text-[9px] font-extrabold text-red-650 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 size={10} />
                          Remove Image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative border-2 border-dashed border-[#e2e8f0] hover:border-[#d97706]/40 rounded-xl p-4 text-center transition-all bg-[#fdfcf7] hover:bg-[#FAF6F0]">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => { handleUploadImageForField(e, 'hero_image_url_2'); setPreviewSlide(2); }}
                        disabled={uploadingField !== null}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      />
                      <div className="space-y-2 flex flex-col items-center justify-center">
                        {uploadingField === 'hero_image_url_2' ? (
                          <>
                            <Loader2 className="w-6 h-6 text-[#d97706] animate-spin" />
                            <p className="text-[10px] font-bold text-[#1e293b]/70">Uploading to Supabase...</p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-[#1e293b]/30" />
                            <div>
                              <p className="text-[10px] font-bold text-[#1e293b]/70">Click or drag image to upload</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SLIDE 3 SECTION */}
              <div className="space-y-4 p-4 rounded-2xl bg-amber-500/[0.03] border border-amber-500/10">
                <span className="text-[10px] font-black text-[#d97706] tracking-widest uppercase block">
                  Slide 3 - Boutique
                </span>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#1e293b]/70 tracking-wider uppercase block">
                    Boutique Title
                  </label>
                  <input
                    type="text"
                    value={config.hero_title_3 || 'Hot Delights at Your Table'}
                    onChange={(e) => { updateField('hero_title_3', e.target.value); setPreviewSlide(3); }}
                    onFocus={() => setPreviewSlide(3)}
                    className="w-full px-4 py-3 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:border-[#d97706]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#1e293b]/70 tracking-wider uppercase block">
                    Boutique Subtitle
                  </label>
                  <textarea
                    value={config.hero_subtitle_3 || 'Freshly baked pastries and signature thalis prepared live in our kitchen.'}
                    onChange={(e) => { updateField('hero_subtitle_3', e.target.value); setPreviewSlide(3); }}
                    onFocus={() => setPreviewSlide(3)}
                    rows={2}
                    className="w-full px-4 py-3 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:border-[#d97706]"
                  />
                </div>

                {/* Hero Background Image Slide 3 */}
                <div className="space-y-2 pt-2 border-t border-[#e2e8f0]/40">
                  <label className="text-[10px] font-bold text-[#1e293b]/70 tracking-wider uppercase block">
                    Slide 3 Background Image
                  </label>
                  
                  {config.hero_image_url_3 ? (
                    <div className="p-3 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#e2e8f0] shrink-0 bg-stone-100 flex items-center justify-center">
                        <img src={config.hero_image_url_3} alt="Hero Slide 3 Preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-[10px] font-bold text-[#1e293b]/80 truncate max-w-[200px]">
                          {config.hero_image_url_3.split('/').pop()}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleRemoveImageForField('hero_image_url_3')}
                          className="text-[9px] font-extrabold text-red-650 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 size={10} />
                          Remove Image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative border-2 border-dashed border-[#e2e8f0] hover:border-[#d97706]/40 rounded-xl p-4 text-center transition-all bg-[#fdfcf7] hover:bg-[#FAF6F0]">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => { handleUploadImageForField(e, 'hero_image_url_3'); setPreviewSlide(3); }}
                        disabled={uploadingField !== null}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      />
                      <div className="space-y-2 flex flex-col items-center justify-center">
                        {uploadingField === 'hero_image_url_3' ? (
                          <>
                            <Loader2 className="w-6 h-6 text-[#d97706] animate-spin" />
                            <p className="text-[10px] font-bold text-[#1e293b]/70">Uploading to Supabase...</p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-[#1e293b]/30" />
                            <div>
                              <p className="text-[10px] font-bold text-[#1e293b]/70">Click or drag image to upload</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'layout' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[#d97706] text-xs leading-relaxed space-y-1 mb-2">
                <p className="font-bold flex items-center gap-1.5"><Eye size={13} /> Feature Visibility & Storefront Layout</p>
                <p className="opacity-90">Control which sections and features are active on your public diner storefront. Enable online ordering, hide prices, or toggle social media feeds instantly.</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* 1. Show Prices */}
                <div className="p-4 rounded-2xl bg-[#f1f5f9] border border-[#e2e8f0] flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-wider text-[#1e293b]">Show Menu Prices</p>
                    <p className="text-[11px] text-[#1e293b]/60 leading-normal">Display item prices on your digital menu storefront.</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={config.show_prices}
                    onClick={() => updateField('show_prices', !config.show_prices)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      config.show_prices ? 'bg-[#d97706]' : 'bg-[#cbd5e1]'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        config.show_prices ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 2. Allow Online Ordering */}
                <div className="p-4 rounded-2xl bg-[#f1f5f9] border border-[#e2e8f0] flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-wider text-[#1e293b]">Allow Online Ordering</p>
                    <p className="text-[11px] text-[#1e293b]/60 leading-normal">Enable cart checkouts and instant digital order placement for diners.</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={config.allow_orders}
                    onClick={() => updateField('allow_orders', !config.allow_orders)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      config.allow_orders ? 'bg-[#d97706]' : 'bg-[#cbd5e1]'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        config.allow_orders ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 3. Show Brand Story */}
                <div className="p-4 rounded-2xl bg-[#f1f5f9] border border-[#e2e8f0] flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-wider text-[#1e293b]">Show Brand Story</p>
                    <p className="text-[11px] text-[#1e293b]/60 leading-normal">Display the "Our Brand Story / About Us" section on the storefront.</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={config.show_story}
                    onClick={() => updateField('show_story', !config.show_story)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      config.show_story ? 'bg-[#d97706]' : 'bg-[#cbd5e1]'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        config.show_story ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {config.show_story && (
                  <div className="p-4 rounded-2xl bg-[#f1f5f9] border border-[#e2e8f0] space-y-4 animate-fade-in mt-2 ml-4 pl-4 border-l-4 border-l-[#d97706]">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#d97706]">📖 Brand Story Customization</h4>
                    
                    {/* Brand Story Title */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[#1e293b]/70 tracking-wider uppercase block">
                        Story Section Title
                      </label>
                      <input
                        type="text"
                        placeholder="Our Culinary Canvas"
                        value={config.about_title || ''}
                        onChange={(e) => updateField('about_title', e.target.value)}
                        className="w-full px-4 py-2 bg-white border border-[#e2e8f0] rounded-xl text-xs focus:outline-none focus:border-[#d97706]"
                      />
                    </div>

                    {/* Brand Story Text */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[#1e293b]/70 tracking-wider uppercase block">
                        Story Narrative / Description
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Founded with a passion for creative culinary expression..."
                        value={config.about_text || ''}
                        onChange={(e) => updateField('about_text', e.target.value)}
                        className="w-full px-4 py-2 bg-white border border-[#e2e8f0] rounded-xl text-xs focus:outline-none focus:border-[#d97706]"
                      />
                    </div>

                    {/* Brand Story Image */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-[#1e293b]/70 tracking-wider uppercase block">
                        Story Featured Image
                      </label>
                      
                      {config.about_image_url ? (
                        <div className="p-3 bg-white border border-[#e2e8f0] rounded-xl flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#e2e8f0] shrink-0 bg-stone-100 flex items-center justify-center">
                            <img src={config.about_image_url} alt="Brand story preview" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-[9px] font-bold text-[#1e293b]/80 truncate max-w-[200px]">
                              {config.about_image_url.split('/').pop()}
                            </p>
                            <button
                              type="button"
                              onClick={() => handleRemoveImageForField('about_image_url')}
                              className="text-[9px] font-extrabold text-red-650 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 size={10} />
                              Remove Image
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="relative border-2 border-dashed border-[#e2e8f0] hover:border-[#d97706]/40 rounded-xl p-3 text-center transition-all bg-white hover:bg-[#FAF6F0]">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleUploadImageForField(e, 'about_image_url')}
                            disabled={uploadingField !== null}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                          />
                          <div className="space-y-1 flex flex-col items-center justify-center">
                            {uploadingField === 'about_image_url' ? (
                              <>
                                <Loader2 className="w-4 h-4 text-[#d97706] animate-spin" />
                                <p className="text-[9px] font-bold text-[#1e293b]/70">Uploading image...</p>
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 text-[#1e293b]/30" />
                                <p className="text-[9px] font-bold text-[#1e293b]/70">Click or drag image to upload</p>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. Show Google Reviews */}
                <div className="p-4 rounded-2xl bg-[#f1f5f9] border border-[#e2e8f0] flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-wider text-[#1e293b]">Show Google Reviews</p>
                    <p className="text-[11px] text-[#1e293b]/60 leading-normal">Display Google Star Reviews block. Requires Google Place ID configured in Integrations.</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={config.show_reviews}
                    onClick={() => updateField('show_reviews', !config.show_reviews)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      config.show_reviews ? 'bg-[#d97706]' : 'bg-[#cbd5e1]'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        config.show_reviews ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 5. Show Instagram Feed */}
                <div className="p-4 rounded-2xl bg-[#f1f5f9] border border-[#e2e8f0] flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-wider text-[#1e293b]">Show Instagram Grid</p>
                    <p className="text-[11px] text-[#1e293b]/60 leading-normal">Display Instagram photos block. Requires Instagram Handle configured in Integrations.</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={config.show_instagram}
                    onClick={() => updateField('show_instagram', !config.show_instagram)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      config.show_instagram ? 'bg-[#d97706]' : 'bg-[#cbd5e1]'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        config.show_instagram ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 6. Show Blog Feed */}
                <div className="p-4 rounded-2xl bg-[#f1f5f9] border border-[#e2e8f0] flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-wider text-[#1e293b]">Show Blog Feed</p>
                    <p className="text-[11px] text-[#1e293b]/60 leading-normal">Display the "Food Stories" editorial blog posts feed section on the storefront.</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={config.show_blog}
                    onClick={() => updateField('show_blog', !config.show_blog)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      config.show_blog ? 'bg-[#d97706]' : 'bg-[#cbd5e1]'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        config.show_blog ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'blogs' && (
            <div className="space-y-4 font-display">
              {editingBlog ? (
                // Edit/Create Post Form
                <form onSubmit={handleSaveBlog} className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-[#e2e8f0]/40 pb-3">
                    <h3 className="text-xs font-black text-[#d97706] tracking-widest uppercase">
                      {editingBlog === 'new' ? '📝 Create New Blog Post' : '📝 Edit Blog Post'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setEditingBlog(null)}
                      className="px-3 py-1.5 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#1e293b]/70 font-bold rounded-xl text-[10px] transition-all cursor-pointer border border-[#e2e8f0]"
                    >
                      ← Back to List
                    </button>
                  </div>

                  {/* Title */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#1e293b]/70 tracking-wider uppercase block">
                      Blog Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. The Art of Pour-Over Coffee Brewing"
                      value={blogTitle}
                      onChange={(e) => setBlogTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:border-[#d97706]"
                    />
                  </div>

                  {/* Excerpt */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#1e293b]/70 tracking-wider uppercase block">
                      Excerpt / Summary
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="e.g. Master the steps, grind sizes, and temperature rules to brew barista-quality pour-overs at home."
                      value={blogExcerpt}
                      onChange={(e) => setBlogExcerpt(e.target.value)}
                      className="w-full px-4 py-3 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:border-[#d97706]"
                    />
                  </div>

                  {/* Content Body */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#1e293b]/70 tracking-wider uppercase block">
                      Content / Body
                    </label>
                    <textarea
                      required
                      rows={6}
                      placeholder="Write your blog story here. You can use standard text paragraphs. (Markdown is supported on storefront rendering)"
                      value={blogContent}
                      onChange={(e) => setBlogContent(e.target.value)}
                      className="w-full px-4 py-3 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:border-[#d97706] font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Author */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#1e293b]/70 tracking-wider uppercase block">
                        Author Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Vikram Barista"
                        value={blogAuthor}
                        onChange={(e) => setBlogAuthor(e.target.value)}
                        className="w-full px-4 py-3 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:border-[#d97706]"
                      />
                    </div>

                    {/* Tags */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#1e293b]/70 tracking-wider uppercase block">
                        Tags (comma-separated)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Coffee, Brewing, Guide"
                        value={blogTags}
                        onChange={(e) => setBlogTags(e.target.value)}
                        className="w-full px-4 py-3 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:border-[#d97706]"
                      />
                    </div>
                  </div>

                  {/* Cover Image */}
                  <div className="space-y-2 pt-2 border-t border-[#e2e8f0]/40">
                    <label className="text-[10px] font-bold text-[#1e293b]/70 tracking-wider uppercase block">
                      Blog Cover Image
                    </label>
                    
                    {blogImageUrl ? (
                      <div className="p-3 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#e2e8f0] shrink-0 bg-stone-100 flex items-center justify-center">
                          <img src={blogImageUrl} alt="Blog cover preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-[10px] font-bold text-[#1e293b]/80 truncate max-w-[200px]">
                            {blogImageUrl.split('/').pop()}
                          </p>
                          <button
                            type="button"
                            onClick={() => setBlogImageUrl('')}
                            className="text-[9px] font-extrabold text-red-650 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 size={10} />
                            Remove Cover Image
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative border-2 border-dashed border-[#e2e8f0] hover:border-[#d97706]/40 rounded-xl p-4 text-center transition-all bg-[#fdfcf7] hover:bg-[#FAF6F0]">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUploadBlogImage}
                          disabled={uploadingField !== null}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        />
                        <div className="space-y-2 flex flex-col items-center justify-center">
                          {uploadingField === 'blog_image' ? (
                            <>
                              <Loader2 className="w-6 h-6 text-[#d97706] animate-spin" />
                              <p className="text-[10px] font-bold text-[#1e293b]/70">Uploading cover image...</p>
                            </>
                          ) : (
                            <>
                              <Upload className="w-6 h-6 text-[#1e293b]/30" />
                              <div>
                                <p className="text-[10px] font-bold text-[#1e293b]/70">Click or drag image to upload</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end gap-2 pt-3 border-t border-[#e2e8f0]/40">
                    <button
                      type="button"
                      onClick={() => setEditingBlog(null)}
                      className="px-4 py-2 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#1e293b]/80 font-bold rounded-xl text-xs transition-all cursor-pointer border border-[#e2e8f0]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingBlog || uploadingField !== null}
                      className="px-5 py-2 bg-gradient-to-r from-[#d97706] to-[#b45309] text-white font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {savingBlog && <Loader2 size={12} className="animate-spin" />}
                      {savingBlog ? 'Saving...' : 'Save Post'}
                    </button>
                  </div>
                </form>
              ) : (
                // List View
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-[#e2e8f0]/40 pb-3">
                    <div className="space-y-0.5">
                      <h3 className="text-xs font-black text-[#d97706] tracking-widest uppercase">
                        📢 Canvas Food Chronicles
                      </h3>
                      <p className="text-[10px] text-[#1e293b]/50">Publish articles, coffee guides, and stories to your diner menu.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => startEditingBlog('new')}
                      className="px-3 py-1.5 bg-gradient-to-r from-[#d97706] to-[#b45309] text-white font-bold rounded-xl text-[10px] transition-all cursor-pointer flex items-center gap-1 shadow-sm hover:opacity-95"
                    >
                      + Add New Post
                    </button>
                  </div>

                  {loadingBlogs ? (
                    <div className="py-8 text-center text-[#1e293b]/40">
                      <span className="inline-block w-6 h-6 border-2 border-[#d97706] border-t-transparent rounded-full animate-spin"></span>
                    </div>
                  ) : blogsList.length === 0 ? (
                    <div className="p-8 border-2 border-dashed border-[#e2e8f0] rounded-2xl text-center space-y-2 bg-[#fdfcf7]">
                      <BookOpen className="w-8 h-8 text-[#1e293b]/30 mx-auto" />
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-[#1e293b]/70">No blog posts found</p>
                        <p className="text-[10px] text-[#1e293b]/40 max-w-[280px] mx-auto leading-normal">
                          You haven't written any custom posts yet. Create one to share your culinary tales, or turn off the Blog Feed toggle in layout settings if not needed.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                      {blogsList.map((blog) => (
                        <div
                          key={blog.id}
                          className="p-3 bg-[#f1f5f9] border border-[#e2e8f0] rounded-2xl flex items-center gap-4 transition-all hover:bg-stone-50"
                        >
                          <div className="w-14 h-14 rounded-xl overflow-hidden border border-[#e2e8f0] shrink-0 bg-stone-100 flex items-center justify-center">
                            {blog.image_url ? (
                              <img src={blog.image_url} alt={blog.title} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-6 h-6 text-[#1e293b]/20" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <h4 className="text-xs font-extrabold text-[#1e293b] truncate">{blog.title}</h4>
                            <p className="text-[9px] text-[#1e293b]/50 line-clamp-1 leading-normal">{blog.excerpt}</p>
                            <div className="flex items-center gap-3 text-[8px] font-bold text-[#1e293b]/40">
                              <span>By {blog.author}</span>
                              <span>•</span>
                              <span>{new Date(blog.published_at || blog.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => startEditingBlog(blog)}
                              className="px-2.5 py-1.5 bg-[#ffffff] hover:bg-[#e2e8f0] border border-[#e2e8f0] text-xs font-bold rounded-xl cursor-pointer transition-all"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              disabled={deletingBlogId === blog.id}
                              onClick={() => handleDeleteBlog(blog.id)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-650 hover:text-red-700 rounded-xl cursor-pointer transition-all"
                            >
                              {deletingBlogId === blog.id ? (
                                <Loader2 size={12} className="animate-spin text-red-600" />
                              ) : (
                                <Trash2 size={12} />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'social' && (
            <>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1e293b]/70 tracking-wider uppercase block">
                  Google Place ID (Reviews Display)
                </label>
                <input
                  type="text"
                  value={config.google_place_id || ''}
                  onChange={(e) => updateField('google_place_id', e.target.value)}
                  className="w-full px-4 py-3 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:border-[#d97706]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1e293b]/70 tracking-wider uppercase block">
                  Instagram Handle (Feed Integration)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#1e293b]/40">@</span>
                  <input
                    type="text"
                    value={config.instagram_handle || ''}
                    onChange={(e) => updateField('instagram_handle', e.target.value)}
                    className="w-full pl-8 pr-4 py-3 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:border-[#d97706]"
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === 'connection' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[#d97706] text-xs leading-relaxed space-y-1">
                <p className="font-bold flex items-center gap-1.5">📲 Your Digital Storefront Links</p>
                <p className="opacity-90">These links are used by your customers to access your storefront menu, place table orders, view visit history, and contact your staff.</p>
              </div>

              {/* Live Production URL */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1e293b]/70 tracking-wider uppercase block">
                  Live Production URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`https://${tenantSlug || tenantPublicId || 'store'}.cafecanvas.bar`}
                    className="flex-1 px-4 py-3 bg-white border border-[#e2e8f0] rounded-xl text-xs font-mono select-all focus:outline-none text-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`https://${tenantSlug || tenantPublicId || 'store'}.cafecanvas.bar`);
                      alert('Live URL copied!');
                    }}
                    className="px-4 py-2.5 bg-[#d97706] hover:bg-[#b45309] text-white text-xs font-bold rounded-xl cursor-pointer transition-all"
                  >
                    Copy
                  </button>
                  <a
                    href={`https://${tenantSlug || tenantPublicId || 'store'}.cafecanvas.bar`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 bg-[#1e293b] hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center cursor-pointer transition-all"
                  >
                    Open ↗
                  </a>
                </div>
              </div>

              {/* Local Dev / Testing URL */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1e293b]/70 tracking-wider uppercase block">
                  Local Dev / Testing URL (PC Browser)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`http://localhost:3000/${tenantSlug || tenantPublicId || 'store'}`}
                    className="flex-1 px-4 py-3 bg-white border border-[#e2e8f0] rounded-xl text-xs font-mono select-all focus:outline-none text-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`http://localhost:3000/${tenantSlug || tenantPublicId || 'store'}`);
                      alert('Local Dev URL copied!');
                    }}
                    className="px-4 py-2.5 bg-stone-500 hover:bg-stone-600 text-white text-xs font-bold rounded-xl cursor-pointer transition-all"
                  >
                    Copy
                  </button>
                  <a
                    href={`http://localhost:3000/${tenantSlug || tenantPublicId || 'store'}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 bg-stone-700 hover:bg-stone-850 text-white text-xs font-bold rounded-xl flex items-center justify-center cursor-pointer transition-all"
                  >
                    Open ↗
                  </a>
                </div>
              </div>

              {/* Local Wifi LAN URL */}
              {localIp && localIp !== '127.0.0.1' && localIp !== 'localhost' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#d97706] tracking-wider uppercase block">
                    📱 Local Wi-Fi Network URL (For Mobile / Tablets)
                  </label>
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[#d97706] text-[11px] leading-relaxed mb-1">
                    Connect your client's mobile phone or tablet to the **same Wi-Fi network** as this server PC, then scan or visit this URL:
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`http://${localIp}:3000/${tenantSlug || tenantPublicId || 'store'}`}
                      className="flex-1 px-4 py-3 bg-white border border-[#eae5d8] rounded-xl text-xs font-mono select-all focus:outline-none text-slate-600"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`http://${localIp}:3000/${tenantSlug || tenantPublicId || 'store'}`);
                        alert('Wi-Fi Testing URL copied!');
                      }}
                      className="px-4 py-2.5 bg-[#d97706] hover:bg-[#b45309] text-white text-xs font-bold rounded-xl cursor-pointer transition-all"
                    >
                      Copy
                    </button>
                    <a
                      href={`http://${localIp}:3000/${tenantSlug || tenantPublicId || 'store'}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2.5 bg-[#1e293b] hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center cursor-pointer transition-all"
                    >
                      Open ↗
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'footer' && (
            <>
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-700 text-xs leading-relaxed space-y-1">
                <p className="font-bold flex items-center gap-1.5"><FileText size={13} /> Footer Information</p>
                <p className="opacity-90">Customize the details shown in your storefront's footer. This appears at the bottom of every page for your customers.</p>
              </div>

              {/* Footer Description */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1e293b]/70 tracking-wider uppercase block">
                  About Description
                </label>
                <textarea
                  value={config.footer_description || ''}
                  onChange={(e) => updateField('footer_description', e.target.value)}
                  rows={3}
                  placeholder="e.g. Serving organic micro-roasted coffees and artisan sourdough breads daily..."
                  className="w-full px-4 py-3 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:border-[#d97706]"
                />
              </div>

              {/* Operating Hours */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1e293b]/70 tracking-wider uppercase flex items-center gap-1.5">
                  <Clock size={12} />
                  Operating Hours
                </label>
                <textarea
                  value={config.footer_hours || ''}
                  onChange={(e) => updateField('footer_hours', e.target.value)}
                  rows={3}
                  placeholder={'Monday - Sunday\n08:30 AM - 10:00 PM\nKitchen closes at 09:30 PM'}
                  className="w-full px-4 py-3 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:border-[#d97706] font-mono text-xs"
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1e293b]/70 tracking-wider uppercase flex items-center gap-1.5">
                  <MapPin size={12} />
                  Address
                </label>
                <input
                  type="text"
                  value={config.footer_address || ''}
                  onChange={(e) => updateField('footer_address', e.target.value)}
                  placeholder="e.g. 123 Brew Lane, Indiranagar, Bangalore 560038"
                  className="w-full px-4 py-3 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:border-[#d97706]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#1e293b]/70 tracking-wider uppercase flex items-center gap-1.5">
                    <PhoneCall size={12} />
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={config.footer_phone || ''}
                    onChange={(e) => updateField('footer_phone', e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:border-[#d97706]"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#1e293b]/70 tracking-wider uppercase flex items-center gap-1.5">
                    <Mail size={12} />
                    Email
                  </label>
                  <input
                    type="email"
                    value={config.footer_email || ''}
                    onChange={(e) => updateField('footer_email', e.target.value)}
                    placeholder="hello@yourcafe.com"
                    className="w-full px-4 py-3 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:border-[#d97706]"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Visual Live Preview Frame */}
      <div className="flex flex-col gap-4 bg-[#fdfcf7] border border-[#e2e8f0]/50 rounded-3xl p-6 shadow-2xl relative min-h-[500px] justify-center items-center">
        {/* Mockup Top Header */}
        <div className="w-full flex items-center justify-between border-b border-[#e2e8f0]/30 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-[#1e293b]/50">
            Live Mobile Storefront Preview
          </span>
        </div>

        {/* Live rendering container */}
        <div className="flex-1 w-full flex justify-center items-center py-4">
          <div
            className={`theme-${config.theme_id ? config.theme_id.replace('theme-', '') : '02'} bg-background text-foreground border-8 border-stone-900 rounded-[38px] overflow-hidden transition-all shadow-2xl relative flex flex-col w-[300px] h-[520px] max-w-full select-none`}
            style={{
              fontFamily: config.font_body
            }}
          >
            {/* Phone notch/camera */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-4 bg-stone-900 rounded-b-2xl z-50 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-stone-800 border border-stone-700/50"></div>
            </div>

            {/* Screen Content Wrapper */}
            <div className="flex-1 flex flex-col pt-4 overflow-y-auto scrollbar-none relative">
              {/* Background patterns based on active theme */}
              {themeDesign.renderBackground()}

              {/* Nav Header */}
              <div className="px-4 py-3 flex items-center justify-between border-b border-border-color/30 bg-card-bg/80 relative z-10">
                <div className="flex items-center gap-2">
                  {tenantLogoUrl && (
                    <img src={tenantLogoUrl} alt="Logo" className="w-6 h-6 rounded-md object-contain bg-white/80" />
                  )}
                  <span className="font-extrabold text-xs font-display text-foreground">
                    {storeName || 'CafeCanvas'}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 opacity-60">
                  <span className="w-3.5 h-0.5 rounded bg-foreground/60"></span>
                  <span className="w-3.5 h-0.5 rounded bg-foreground/60"></span>
                </div>
              </div>

              {/* Hero Render */}
              <div
                className="p-6 text-center flex flex-col justify-center items-center gap-3 relative overflow-hidden"
                style={{
                  backgroundImage: (() => {
                    const bgUrl = previewSlide === 1 ? config.hero_image_url :
                                  previewSlide === 2 ? config.hero_image_url_2 :
                                  config.hero_image_url_3;
                    return bgUrl ? `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url(${bgUrl})` : 'none';
                  })(),
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  minHeight: '145px'
                }}
              >
                {!(previewSlide === 1 ? config.hero_image_url :
                   previewSlide === 2 ? config.hero_image_url_2 :
                   config.hero_image_url_3) && (
                  <div className="absolute inset-0 bg-brand-light opacity-30 z-0"></div>
                )}

                {/* Slide indicator pill / badge */}
                <div className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded-full bg-black/45 text-[8px] font-black text-white uppercase tracking-wider scale-90">
                  Slide {previewSlide} Preview
                </div>

                <h3 className="text-sm font-extrabold tracking-tight font-display leading-tight z-10" style={{ fontFamily: config.font_heading, color: (
                  previewSlide === 1 ? config.hero_image_url :
                  previewSlide === 2 ? config.hero_image_url_2 :
                  config.hero_image_url_3
                ) ? '#ffffff' : 'var(--foreground)' }}>
                  {(() => {
                    const rawTitle = previewSlide === 1 ? (config.hero_title || 'Welcome to Cafe Canvas') :
                                     previewSlide === 2 ? (config.hero_title_2 || "Our Barista's Masterpieces") :
                                     (config.hero_title_3 || 'Hot Delights at Your Table');
                    return rawTitle.replace('Cafe Canvas', storeName || 'CafeCanvas');
                  })()}
                </h3>
                <p className="text-[9px] max-w-[210px] leading-relaxed z-10" style={{ color: (
                  previewSlide === 1 ? config.hero_image_url :
                  previewSlide === 2 ? config.hero_image_url_2 :
                  config.hero_image_url_3
                ) ? 'rgba(255,255,255,0.85)' : 'var(--foreground)' }}>
                  {previewSlide === 1 ? (config.hero_subtitle || 'Artisan coffee, handcrafted meals, and warm boutique hospitality.') :
                   previewSlide === 2 ? (config.hero_subtitle_2 || 'Every cup is a canvas. Discover our premium organic blends and slow pour-overs.') :
                   (config.hero_subtitle_3 || 'Freshly baked pastries and signature thalis prepared live in our kitchen.')}
                </p>
                <button
                  className={`px-3 py-1.5 text-[8px] font-extrabold transition-all cursor-default z-10 ${themeDesign.buttonClass} scale-90`}
                >
                  View Menu
                </button>

                {/* Swiper-like bullet indicators in preview */}
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-20 flex gap-1">
                  {[1, 2, 3].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setPreviewSlide(num as 1 | 2 | 3)}
                      className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                        previewSlide === num ? 'bg-[#FFC9CD] scale-125' : 'bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Menu Sections Preview */}
              <div className="p-4 flex-1 space-y-4 relative z-10">
                <span className="text-[10px] font-extrabold text-foreground/40 uppercase tracking-widest block">
                  Featured Categories
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div className={`${themeDesign.cardClass} p-3 flex flex-col gap-1 items-center`}>
                    <div className="w-6 h-6 rounded-full bg-brand-light flex items-center justify-center text-brand">
                      <Sparkles size={12} />
                    </div>
                    <span className="text-[10px] font-bold text-foreground mt-1">Coffee</span>
                  </div>
                  <div className={`${themeDesign.cardClass} p-3 flex flex-col gap-1 items-center`}>
                    <div className="w-6 h-6 rounded-full bg-brand-light flex items-center justify-center text-brand">
                      <Sparkles size={12} />
                    </div>
                    <span className="text-[10px] font-bold text-foreground mt-1">Snacks</span>
                  </div>
                </div>

                {/* Brand Story Preview */}
                {config.show_story && (
                  <div className={`${themeDesign.cardClass} p-3 mt-4 space-y-2 text-left`}>
                    <h5 className="font-extrabold text-[10px] text-foreground">
                      {config.about_title || 'Our Culinary Canvas'}
                    </h5>
                    <p className="text-[8px] text-foreground/60 leading-relaxed line-clamp-3">
                      {config.about_text || 'Founded with a passion for creative culinary expression...'}
                    </p>
                    {config.about_image_url && (
                      <div className="w-full h-16 rounded-lg overflow-hidden mt-1 bg-stone-100">
                        <img src={config.about_image_url} alt="Brand story preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Floating Call Staff Button Preview */}
              <div className="absolute bottom-4 right-4 z-20">
                {themeDesign.renderCallStaffButton({
                  onClick: () => {},
                  disabled: false,
                  cooldown: 0,
                  isCalling: false
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Logo Crop Modal Overlay */}
    {logoCropOpen && logoCropSrc && (
      <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { setLogoCropOpen(false); setLogoCropSrc(null); }}>
        <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4 relative" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#1e293b] flex items-center gap-2">
              <Crop size={16} className="text-[#d97706]" />
              Crop Your Logo
            </h3>
            <button onClick={() => { setLogoCropOpen(false); setLogoCropSrc(null); }} className="text-[#1e293b]/40 hover:text-[#1e293b] text-lg font-bold cursor-pointer">✕</button>
          </div>

          <p className="text-[10px] text-[#1e293b]/50">Drag the square to position. Drag the bottom-right corner to resize. Logo will be exported as 256×256 PNG.</p>

          <div
            ref={cropContainerRef}
            className="relative inline-block mx-auto bg-[#f1f5f9] rounded-xl overflow-hidden border border-[#e2e8f0] select-none"
            style={{ maxWidth: '100%', cursor: isDragging ? 'grabbing' : 'default' }}
            onMouseMove={handleCropMouseMove}
            onMouseUp={handleCropMouseUp}
            onMouseLeave={handleCropMouseUp}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={cropImgRef}
              src={logoCropSrc}
              alt="Crop preview"
              onLoad={handleCropImgLoad}
              className="block max-h-[320px] max-w-full object-contain"
              draggable={false}
            />
            {/* Dark overlay outside crop */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(0,0,0,0.45)', clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${cropPos.x}px ${cropPos.y}px, ${cropPos.x}px ${cropPos.y + cropSize}px, ${cropPos.x + cropSize}px ${cropPos.y + cropSize}px, ${cropPos.x + cropSize}px ${cropPos.y}px, ${cropPos.x}px ${cropPos.y}px)` }} />
            {/* Crop selection box */}
            <div
              className="absolute border-2 border-white/90 shadow-lg"
              style={{ left: cropPos.x, top: cropPos.y, width: cropSize, height: cropSize, cursor: 'grab' }}
              onMouseDown={(e) => handleCropMouseDown(e, 'drag')}
            >
              {/* Grid lines */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/30" />
                <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/30" />
                <div className="absolute top-1/3 left-0 right-0 h-px bg-white/30" />
                <div className="absolute top-2/3 left-0 right-0 h-px bg-white/30" />
              </div>
              {/* Resize handle */}
              <div
                className="absolute -right-1.5 -bottom-1.5 w-4 h-4 bg-white border-2 border-[#d97706] rounded-full shadow cursor-nwse-resize"
                onMouseDown={(e) => handleCropMouseDown(e, 'resize')}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => { setLogoCropOpen(false); setLogoCropSrc(null); }}
              className="px-4 py-2.5 bg-[#f1f5f9] border border-[#e2e8f0] text-[#1e293b]/70 text-xs font-bold rounded-xl cursor-pointer hover:bg-[#e2e8f0] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyCrop}
              disabled={uploadingLogo}
              className="px-5 py-2.5 bg-gradient-to-r from-[#d97706] to-[#f59e0b] text-white text-xs font-extrabold rounded-xl cursor-pointer transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center gap-2"
            >
              {uploadingLogo ? (
                <><Loader2 size={13} className="animate-spin" /> Uploading...</>
              ) : (
                <><Crop size={13} /> Crop & Upload Logo</>
              )}
            </button>
          </div>
        </div>
      </div>
    )}
  </>);
}
