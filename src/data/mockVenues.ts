import { Venue } from '../types';

export const MOCK_VENUES: Venue[] = [
  {
    id: '1',
    name: 'สนามฟุตบอล สวนลุมพินี',
    description: 'สนามหญ้าเทียม ขนาดมาตรฐาน เปิดทุกวัน 08:00-22:00',
    address_line: 'ถ.พระราม 4 แขวงพระโขนง เขตคลองเตย กทม.',
    sport_type: 'ฟุตบอล',
    price_per_hour: 1200,
    owner_id: 'owner1',
    open_time: '08:00:00',
    close_time: '22:00:00',
    province: 'กรุงเทพมหานคร',
    district: 'เขตคลองเตย',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      {
        id: 'img1',
        field_id: '1',
        object_key: 'mock/1.jpg',
        image_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800',
        sort_order: 0
      }
    ]
  },
  {
    id: '2',
    name: 'คอร์ทเทนนิส สยามสปอร์ต',
    description: 'คอร์ทฮาร์ดคอร์ท 2 คอร์ท มีไฟส่องสว่าง',
    address_line: 'สยามสแควร์ ซอย 5 กทม.',
    sport_type: 'เทนนิส',
    price_per_hour: 800,
    owner_id: 'owner1',
    open_time: '07:00:00',
    close_time: '21:00:00',
    province: 'กรุงเทพมหานคร',
    district: 'เขตปทุมวัน',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      {
        id: 'img2',
        field_id: '2',
        object_key: 'mock/2.jpg',
        image_url: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&q=80&w=800',
        sort_order: 0
      }
    ]
  },
  {
    id: '3',
    name: 'สนามบาสเกตบอล ลาดพร้าว',
    description: 'สนามกลางแจ้ง มีหลังคา ครึ่งคอร์ทและเต็มคอร์ท',
    address_line: 'ถ.ลาดพร้าว แขวงจอมพล เขตจตุจักร กทม.',
    sport_type: 'บาสเกตบอล',
    price_per_hour: 500,
    owner_id: 'owner2',
    open_time: '06:00:00',
    close_time: '22:00:00',
    province: 'กรุงเทพมหานคร',
    district: 'เขตจตุจักร',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      {
        id: 'img3',
        field_id: '3',
        object_key: 'mock/3.jpg',
        image_url: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&q=80&w=800',
        sort_order: 0
      }
    ]
  },
];
