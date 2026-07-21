import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { MapPin, Search, SlidersHorizontal, Sparkles, Wand2 } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getMyWardrobeApiV1ClosetItemsGetOptions } from '@/api/@tanstack/react-query.gen';

const CATEGORIES = ['All', 'Shirts', 'Pants', 'Shoes', 'Jackets', 'Accessories'];

const WARDROBE_ITEMS = [
  {
    id: 'w-1',
    name: 'Linen Shirt',
    category: 'Shirts',
    color: 'White',
    colorHex: '#ffffff',
    style: 'Formal',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCVgfYmapeQ-HJvv6wJ9BiseT1knxEBVrvlthpI9Dm4X8KvFp5MEKuJg69XuhyRhC82PJmwhEFWSPb_WsSaQwR2G4ajOfpX-DjDHu3KhcYygmCKGWNXalj6clc2QzLkyIiRFB3iRHjhXWzJ_68N-02v59e_c1gBwOWw2MyA-CqEDygjqvjxAagYRkxsZBO-PDeDMpRUZA3z_uA-yI-XM8z2lvYGZZBs3epXmj44F4cjG2aY4lE3rJHfErWXyFosG4qSodttdJ8YA9s',
    isAiFixed: true,
  },
  {
    id: 'w-2',
    name: 'Raw Denim',
    category: 'Pants',
    color: 'Indigo',
    colorHex: '#1E293B',
    style: 'Casual',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDnIRWY9adfStEp51RCswUyfDuSVDxsmMI6QXChkJzFmOLOf97FSQgAaclsYo5S624FHJi46LCnSWdzLjLGhWuSsRB9PdB5Ug6KrQpXtcJHnvEEd1j9YcV9lEncb3p7aw5iLHv9IFYYdEIUUY5imhOHOyJamS77gULp1kYze2AR-1P44S97iGnJKArYksXNpfNAL9CG0JVrgJNS5Ey6_IpE9zASGohPh2V4urUPMfGs0Vf1WZVWJ-UDVb39FI9otM18hAbW3tLVQn0',
    isAiFixed: false,
  },
  {
    id: 'w-3',
    name: 'Cashmere Knit',
    category: 'Shirts',
    color: 'Charcoal',
    colorHex: '#4B5563',
    style: 'Formal',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB6mY04Q-Fdv8oAjV9WegW_uEVYdaaGhXSwmtYK3yDqjWL33lg6kUvRlEwy_qx3DcJa7yBSKukBF2hjdzGkR4RlrOy3noj5iDnZeKQZQ5fndgxTF05OMlDkEH-MYQRAUHrtPHXBAHSonIRE7LzbOmEJYmnWxreFA2RBg3Lp1hFt7m_OGkE_fkBg7tFeKvQVqnWCdvDaIkcRMYYcTMyX_2blfiPe07_iJahc4ZTnMuiw60ooyCBFcfDDK3n_NcHKxKvLzByuGICQizU',
    isAiFixed: false,
  },
  {
    id: 'w-4',
    name: 'Leather Court',
    category: 'Shoes',
    color: 'White',
    colorHex: '#ffffff',
    style: 'Casual',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA3kfc988wbn_CqZ6eIHUpbQK_QoRMuULquG7TWhoy_C_F7UdTHkY7h2Tv3wHNVrJR55ZGdeCFZCogn5GiTB2y0l7gxoTCul3f7ram2EFRnwvA-GDYicSNMqSP2VxcVfxmqahCxnARF8dBZos_b68RhFL1V3Z133bWAShm-lfPs-e8bDCBIr34GOVPQUfT-GCrEWs3DTzzmBHbDF-2_6Y3QK1C6AXEhBl0x6e17iLHiieGLGzXhyB7Fp7Y8yVmEG65UUrH2RP3yLBI',
    isAiFixed: false,
  },
  {
    id: 'w-5',
    name: 'Wool Overcoat',
    category: 'Jackets',
    color: 'Camel',
    colorHex: '#C29367',
    style: 'Formal',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAS3E6Aubpq_6ZI3_e4JENehfzl7E47fopTwTHZsH2WdqvVTWutka7Pi1okLQjNRVEtjW8sqerDh-0ADzkJzg9J9lK_sS1kkn95DrEAoS65d4FbUfw8iryB5IJW7pBLHY0wvdg1KnV88KKfvwHmJN8NBSzHKnQu0WT2TCM8o1I6QbHBtB_ezIDG1rbAA3RtrHACbQIIwDSzewcBe-FmpBh23Wp_DGSXLto1Nf1a6YMFOB669fV8kDJ8v2t70Cij1zR8EChV5ZkEQp8',
    isAiFixed: false,
  },
  {
    id: 'w-6',
    name: 'Tech Jacket',
    category: 'Jackets',
    color: 'Black',
    colorHex: '#000000',
    style: 'Casual',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAl6f9uypS74Y97PKBqP59CV9IBVG6KkCY519hzW9zRGQsmWpwyrDmgLPJvZDj_NM9C5h35yEH2dr0n2o2QxhT7iJasHIVcGiRi_Ey98etPthTOdMVZEe3NTFK3VoZ7HTqItfYf_Fn8ZQFNHWgfOl19f8SVoy0a2qlWz4mndO1n5sJG6oXG8KWUztHfF-mQ_0M7yL9EvGnQT5DV3YqLKkOOcgOSaDPmo1cArGfrNrGGdY2gysFwCHry0tOBywXLTU3mwtFminYe-gs',
    isAiFixed: false,
  },
];

export default function ClosetScreen() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch Wardrobe items using API query
  const { data: wardrobeData } = useQuery(getMyWardrobeApiV1ClosetItemsGetOptions());

  const itemsList = wardrobeData && wardrobeData.length > 0
    ? wardrobeData.map((item, index) => {
        const fallback = WARDROBE_ITEMS[index % WARDROBE_ITEMS.length];
        return {
          id: String(item.id),
          name: item.name,
          category: item.category,
          color: fallback.color,
          colorHex: fallback.colorHex,
          style: fallback.style,
          image: item.image_url || fallback.image,
          isAiFixed: index === 0,
        };
      })
    : WARDROBE_ITEMS;

  const filteredItems = itemsList.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.color.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <SafeAreaView className="flex-1 bg-surface w-full max-w-full overflow-hidden" edges={['top']}>
      {/* Header */}
      <View className="flex-row justify-between items-center px-margin-mobile py-4 border-b border-outline-variant/30">
        <View className="flex-row items-center gap-2">
          <MapPin size={22} className="text-primary" />
          <Text className="font-sans font-bold text-headline-md text-on-surface">FitCheck AI</Text>
        </View>
        <Pressable className="flex-row items-center gap-1.5 bg-primary px-4 py-2 rounded-full active:scale-95">
          <Wand2 size={16} className="text-white" />
          <Text className="font-sans font-semibold text-label-md text-white">Build Outfit</Text>
        </Pressable>
      </View>

      {/* Search & Filter */}
      <View className="px-margin-mobile pt-4 flex-row gap-3 items-center">
        <View className="flex-1 h-12 bg-surface-container-low rounded-xl px-4 flex-row items-center gap-2 border border-outline-variant/20">
          <Search size={20} className="text-on-surface-variant" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search your closet..."
            placeholderTextColor="#6e7977"
            className="flex-1 font-sans text-body-md text-on-surface"
          />
        </View>
        <Pressable className="h-12 w-12 bg-surface-container-low rounded-xl items-center justify-center border border-outline-variant/20 active:scale-95">
          <SlidersHorizontal size={20} className="text-on-surface-variant" />
        </Pressable>
      </View>

      {/* Categories Wrapping Container */}
      <View className="py-4 px-margin-mobile flex-row flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const isActive = cat === activeCategory;
          return (
            <Pressable
              key={cat}
              onPress={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full active:scale-95 border transition-all ${
                isActive
                  ? 'bg-primary border-primary'
                  : 'bg-surface-container-low border-outline-variant/20'
              }`}
            >
              <Text
                className={`font-sans font-semibold text-label-md ${
                  isActive ? 'text-white' : 'text-on-surface-variant'
                }`}
              >
                {cat}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Wardrobe Grid Items */}
      <FlatList
        data={filteredItems}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 20 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <Pressable className="w-[47%] bg-white rounded-2xl overflow-hidden border border-[#E2E8F0] mb-4 shadow-sm active:scale-98">
            <View className="relative aspect-[4/5] bg-[#F1F5F9] items-center justify-center p-4">
              <Image source={item.image} className="w-full h-full" contentFit="contain" />
              {item.isAiFixed && (
                <View className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full border border-black/5">
                  <Sparkles size={14} className="text-primary fill-primary" />
                </View>
              )}
            </View>
            <View className="p-3">
              <View className="flex-row items-center gap-1.5 mb-1">
                <View
                  style={{ backgroundColor: item.colorHex }}
                  className="w-2.5 h-2.5 rounded-full border border-outline-variant/30"
                />
                <Text className="font-sans font-bold text-label-sm text-outline uppercase tracking-wider">
                  {item.color}
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="font-sans font-bold text-body-md text-on-surface truncate flex-1 mr-1">
                  {item.name}
                </Text>
                <View
                  className={`px-2 py-0.5 rounded ${
                    item.style === 'Formal' ? 'bg-emerald-50' : 'bg-surface-container-high'
                  }`}
                >
                  <Text
                    className={`font-sans font-bold text-[10px] uppercase ${
                      item.style === 'Formal' ? 'text-primary' : 'text-secondary'
                    }`}
                  >
                    {item.style}
                  </Text>
                </View>
              </View>
            </View>
          </Pressable>
        )}
        keyExtractor={(item) => item.id}
      />
    </SafeAreaView>
  );
}
