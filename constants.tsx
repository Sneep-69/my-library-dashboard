
import { Book } from './types';

export const RECENT_BOOKS: Book[] = [
  {
    id: '1',
    title: 'Circe',
    author: 'Madeline Miller',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpCEY8WwYbcuT7hPTIds7a26gm5XTARkmmGmk6Qo0y545NMlPEDjbA9SlJwreTOOPlEmTORFsbDmKahbYQsNuzF4RFU_tGu8_1-4KHoSH5bgCVyYOxQ7QKJqxk9squKz2UXuND-g4kvA3Bks2fuJsl37DjZqqNxJkt5T-oYcQPbdOq5sG864gTczIDzMwSDx2uxryGOBXFVnobxdFZqxR2QJDRa5w_sYjNK0WUXMxOgexmWm_Wu8FCFNo-BkJG1ooJUJfGyCnP-7g',
    summary: 'A bold and subversive retelling of the goddess Circe\'s life, weaving together myth and humanity.',
    isRead: true,
    addedAt: Date.now() - 1000000
  },
  {
    id: '2',
    title: 'Atomic Habits',
    author: 'James Clear',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBaw3Q3fFsqo7bHRKozaYIhdJFpF7d0n6IEWCMTpFST-9uTpmhZ4OtGCuMN-wAJFDr3xpZY3BUhPuLOIoOZWHCvKElUW1QVFJTgA9tAAS1yzdGu7q1Dq1NqvTw7ovdk6A2OQcvF_528xNtQ_h52FaHCDoxCSldbFJQNjvJ7PsY1iLFOSasR1g_jtyt1C0RBHNrav_G-eUBkGKp7GbrMAQJP8iHSVJlMrKm5e7SRScmadK2Bi82v2Fx-QOiG-nAv7gVGk2Z51trZgIk',
    summary: 'A practical guide to breaking bad habits and building good ones through small, incremental changes.',
    isRead: false,
    addedAt: Date.now() - 500000
  },
  {
    id: '3',
    title: 'Klara and the Sun',
    author: 'Kazuo Ishiguro',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrLPGUA-8KMGKU-eFjZiwNKYYnEK1F7FE8UJJsMSvNRXLTDK4FZ4qBTDEDM3oOgB9EzDgptvWn9txVrOlWMW9mMKMkVwu7HR1fntV9bMQ4qi2DBXbpnogFjsp4-vMyM_yQ18NvW4kfe7NNHczExrKGo7gJ3NvGNDHRaEdsJTOD9mHOYo908bQARtrGIWkQ1Fn399JHjNBkSBLLcYR1ORnd310AM_Yuab4U-ViP49CrmrLTKJdht5ddK4FxDuHKaBOnvDMCVNSmMA8',
    summary: 'Through the eyes of an "Artificial Friend", Ishiguro explores what it means to love and be human.',
    isRead: false,
    addedAt: Date.now() - 200000
  }
];
