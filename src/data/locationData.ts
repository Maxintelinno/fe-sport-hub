export interface District {
    id: string;
    name: string;
}

export interface Province {
    id: string;
    name: string;
    districts: District[];
}

export const THAI_LOCATIONS: Province[] = [
    {
        id: '1',
        name: 'กรุงเทพมหานคร',
        districts: [
            { id: '101', name: 'เขตพระนคร' },
            { id: '102', name: 'เขตดุสิต' },
            { id: '103', name: 'เขตปทุมวัน' },
            { id: '104', name: 'เขตบางรัก' },
            { id: '105', name: 'เขตบางนา' },
            { id: '106', name: 'เขตจตุจักร' },
            { id: '107', name: 'เขตลาดพร้าว' },
            { id: '108', name: 'เขตคลองเตย' },
            { id: '109', name: 'เขตวัฒนา' },
        ],
    },
    {
        id: '2',
        name: 'นนทบุรี',
        districts: [
            { id: '201', name: 'เมืองนนทบุรี' },
            { id: '202', name: 'ปากเกร็ด' },
            { id: '203', name: 'บางใหญ่' },
            { id: '204', name: 'บางบัวทอง' },
        ],
    },
    {
        id: '3',
        name: 'สมุทรปราการ',
        districts: [
            { id: '301', name: 'เมืองสมุทรปราการ' },
            { id: '302', name: 'บางพลี' },
            { id: '303', name: 'พระประแดง' },
        ],
    },
    {
        id: '4',
        name: 'ปทุมธานี',
        districts: [
            { id: '401', name: 'เมืองปทุมธานี' },
            { id: '402', name: 'คลองหลวง' },
            { id: '403', name: 'ธัญบุรี' },
        ],
    },
    {
        id: '5',
        name: 'ชลบุรี',
        districts: [
            { id: '501', name: 'เมืองชลบุรี' },
            { id: '502', name: 'บางละมุง (พัทยา)' },
            { id: '503', name: 'ศรีราชา' },
        ],
    },
];

export const SPORT_TYPES = [
    'ฟุตบอล',
    'บาสเกตบอล',
    'แบดมินตัน',
    'เทนนิส',
    'ปิงปอง',
    'วอลเลย์บอล',
    'ว่ายน้ำ',
    'มวยไทย',
    'ยิมนาสติก',
    'โยคะ',
];
