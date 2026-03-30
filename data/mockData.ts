export const dashboardStats = [
  { id: 1, title: "Total Students", value: "12,847", change: "+5.2%", trend: "up" },
  { id: 2, title: "Active Courses", value: "342", change: "+12", trend: "up" },
  { id: 3, title: "Faculty Members", value: "856", change: "+3", trend: "up" },
  { id: 4, title: "Library Books", value: "45,230", change: "-23", trend: "down" },
];

export const recentActivities = [
  { id: 1, type: "course", title: "New course added: Advanced Machine Learning", time: "2 hours ago" },
  { id: 2, type: "student", title: "150 new student registrations", time: "4 hours ago" },
  { id: 3, type: "event", title: "Annual Tech Fest announced for March", time: "Yesterday" },
  { id: 4, type: "library", title: "Digital library updated with 500 new e-books", time: "2 days ago" },
];

export const upcomingEvents = [
  { id: 1, title: "Mid-Semester Examinations", date: "Mar 15-25", type: "exam" },
  { id: 2, title: "Tech Symposium 2024", date: "Mar 28", type: "event" },
  { id: 3, title: "Alumni Meet", date: "Apr 5", type: "event" },
  { id: 4, title: "Sports Day", date: "Apr 12", type: "sports" },
];

export const timetableSlots = [
  { id: 1, day: "Monday", time: "09:00-10:00", subject: "Data Structures", room: "CS-101", faculty: "Dr. Smith" },
  { id: 2, day: "Monday", time: "10:00-11:00", subject: "Database Systems", room: "CS-102", faculty: "Prof. Johnson" },
  { id: 3, day: "Monday", time: "11:30-12:30", subject: "Computer Networks", room: "CS-103", faculty: "Dr. Williams" },
  { id: 4, day: "Tuesday", time: "09:00-10:00", subject: "Machine Learning", room: "CS-201", faculty: "Dr. Brown" },
  { id: 5, day: "Tuesday", time: "10:00-11:00", subject: "Web Development", room: "CS-105", faculty: "Prof. Davis" },
  { id: 6, day: "Wednesday", time: "09:00-10:00", subject: "Data Structures", room: "CS-101", faculty: "Dr. Smith" },
  { id: 7, day: "Wednesday", time: "11:30-12:30", subject: "Software Engineering", room: "CS-104", faculty: "Dr. Miller" },
  { id: 8, day: "Thursday", time: "09:00-10:00", subject: "Machine Learning", room: "CS-201", faculty: "Dr. Brown" },
  { id: 9, day: "Thursday", time: "10:00-11:00", subject: "Database Systems", room: "CS-102", faculty: "Prof. Johnson" },
  { id: 10, day: "Friday", time: "09:00-10:00", subject: "Web Development Lab", room: "Lab-01", faculty: "Prof. Davis" },
];

export const courses = [
  { id: 1, code: "CS301", name: "Data Structures & Algorithms", credits: 4, semester: 3 },
  { id: 2, code: "CS302", name: "Database Management Systems", credits: 4, semester: 3 },
  { id: 3, code: "CS303", name: "Computer Networks", credits: 3, semester: 3 },
  { id: 4, code: "CS401", name: "Machine Learning", credits: 4, semester: 4 },
  { id: 5, code: "CS402", name: "Software Engineering", credits: 3, semester: 4 },
  { id: 6, code: "CS403", name: "Web Technologies", credits: 3, semester: 4 },
];

export const syllabusResources = [
  { id: 1, title: "Data Structures Complete Notes", type: "PDF", course: "CS301", downloads: 1245, date: "2024-01-15" },
  { id: 2, title: "Database Design Patterns", type: "PDF", course: "CS302", downloads: 890, date: "2024-01-20" },
  { id: 3, title: "ML Algorithms Video Series", type: "Video", course: "CS401", downloads: 2100, date: "2024-02-01" },
  { id: 4, title: "Networking Fundamentals", type: "PDF", course: "CS303", downloads: 756, date: "2024-02-05" },
  { id: 5, title: "Software Design Principles", type: "PDF", course: "CS402", downloads: 623, date: "2024-02-10" },
];

export const libraryBooks = [
  { id: 1, title: "Introduction to Algorithms", author: "Cormen et al.", isbn: "978-0262033848", status: "available", copies: 5 },
  { id: 2, title: "Clean Code", author: "Robert C. Martin", isbn: "978-0132350884", status: "available", copies: 3 },
  { id: 3, title: "Design Patterns", author: "Gang of Four", isbn: "978-0201633610", status: "reserved", copies: 2 },
  { id: 4, title: "The Pragmatic Programmer", author: "Hunt & Thomas", isbn: "978-0135957059", status: "available", copies: 4 },
  { id: 5, title: "Database System Concepts", author: "Silberschatz", isbn: "978-0078022159", status: "borrowed", copies: 0 },
  { id: 6, title: "Computer Networks", author: "Tanenbaum", isbn: "978-0132126953", status: "available", copies: 6 },
];

export const hostelRooms = [
  { id: 1, roomNo: "A-101", block: "Block A", capacity: 2, occupied: 2, status: "full" },
  { id: 2, roomNo: "A-102", block: "Block A", capacity: 2, occupied: 1, status: "available" },
  { id: 3, roomNo: "A-103", block: "Block A", capacity: 3, occupied: 3, status: "full" },
  { id: 4, roomNo: "B-201", block: "Block B", capacity: 2, occupied: 0, status: "maintenance" },
  { id: 5, roomNo: "B-202", block: "Block B", capacity: 2, occupied: 2, status: "full" },
];

export const messMenu = [
  { day: "Monday", breakfast: "Poha, Tea, Fruits", lunch: "Rice, Dal, Sabzi, Roti", dinner: "Paneer Curry, Rice, Chapati" },
  { day: "Tuesday", breakfast: "Idli, Sambar, Coffee", lunch: "Biryani, Raita, Salad", dinner: "Dal Makhani, Jeera Rice" },
  { day: "Wednesday", breakfast: "Paratha, Curd, Tea", lunch: "Rajma, Rice, Roti", dinner: "Mixed Veg, Pulao" },
  { day: "Thursday", breakfast: "Upma, Chutney, Coffee", lunch: "Chole, Bhature, Salad", dinner: "Palak Paneer, Naan" },
  { day: "Friday", breakfast: "Bread, Omelette, Juice", lunch: "Fish Curry, Rice, Dal", dinner: "Chicken Curry, Roti" },
  { day: "Saturday", breakfast: "Dosa, Sambar, Coffee", lunch: "Kadhi, Rice, Papad", dinner: "Pasta, Garlic Bread" },
  { day: "Sunday", breakfast: "Puri, Bhaji, Lassi", lunch: "Special Thali", dinner: "Pizza Night" },
];

export const laundrySlots = [
  { id: 1, time: "08:00 - 10:00", available: true, bookedBy: null },
  { id: 2, time: "10:00 - 12:00", available: false, bookedBy: "John Doe" },
  { id: 3, time: "12:00 - 14:00", available: true, bookedBy: null },
  { id: 4, time: "14:00 - 16:00", available: false, bookedBy: "Jane Smith" },
  { id: 5, time: "16:00 - 18:00", available: true, bookedBy: null },
  { id: 6, time: "18:00 - 20:00", available: true, bookedBy: null },
];

export const alumniProfiles = [
  { id: 1, name: "Sarah Johnson", batch: "2020", company: "Google", role: "Software Engineer", location: "California", avatar: "" },
  { id: 2, name: "Michael Chen", batch: "2019", company: "Microsoft", role: "Product Manager", location: "Seattle", avatar: "" },
  { id: 3, name: "Emily Davis", batch: "2021", company: "Amazon", role: "Data Scientist", location: "New York", avatar: "" },
  { id: 4, name: "David Wilson", batch: "2018", company: "Meta", role: "ML Engineer", location: "London", avatar: "" },
  { id: 5, name: "Lisa Anderson", batch: "2020", company: "Apple", role: "iOS Developer", location: "Cupertino", avatar: "" },
];

export const scholarships = [
  { id: 1, name: "Merit Excellence Award", amount: "$5,000", deadline: "2024-03-31", eligibility: "CGPA > 9.0", status: "open" },
  { id: 2, name: "Sports Achievement Grant", amount: "$3,000", deadline: "2024-04-15", eligibility: "State-level player", status: "open" },
  { id: 3, name: "Research Fellowship", amount: "$10,000", deadline: "2024-05-01", eligibility: "Published research", status: "upcoming" },
  { id: 4, name: "Need-Based Support", amount: "$2,500", deadline: "2024-03-20", eligibility: "Income < $50k", status: "open" },
];

export const events = [
  {
    id: 1,
    title: "TechFest 2024",
    type: "fest",
    date: "2024-03-05",
    venue: "Main Auditorium",
    tickets: 500,
    sold: 420,
  },
  {
    id: 2,
    title: "AI Workshop",
    type: "technical",
    date: "2024-03-10",
    venue: "Lab Block A",
    tickets: 200,
    sold: 120,
  },
  {
    id: 3,
    title: "Cultural Night",
    type: "cultural",
    date: "2024-03-15",
    venue: "Open Ground",
    tickets: 300,
    sold: 250,
  },
  {
    id: 4,
    title: "Startup Meetup",
    type: "networking",
    date: "2024-03-20",
    venue: "Seminar Hall",
    tickets: 150,
    sold: 60,
  },
];


export const lostFoundItems = [
  { id: 1, item: "Blue Backpack", location: "Library", date: "2024-02-25", status: "lost", contact: "John - 9876543210" },
  { id: 2, item: "iPhone 13", location: "Cafeteria", date: "2024-02-24", status: "found", contact: "Security Office" },
  { id: 3, item: "Student ID Card", location: "Sports Complex", date: "2024-02-23", status: "lost", contact: "Mike - 9123456780" },
  { id: 4, item: "Calculator", location: "Exam Hall", date: "2024-02-22", status: "found", contact: "Admin Office" },
];

export const wifiIssues = [
  { id: "TKT-001", issue: "No connectivity in Block C", location: "Hostel Block C", status: "in-progress", reported: "2024-02-25" },
  { id: "TKT-002", issue: "Slow speed during peak hours", location: "Library", status: "open", reported: "2024-02-24" },
  { id: "TKT-003", issue: "Frequent disconnections", location: "CS Lab", status: "resolved", reported: "2024-02-20" },
];

export const counselingSlots = [
  { id: 1, counselor: "Dr. Amanda White", specialization: "Stress Management", date: "2024-03-01", time: "10:00 AM", available: true },
  { id: 2, counselor: "Dr. James Brown", specialization: "Career Guidance", date: "2024-03-01", time: "02:00 PM", available: true },
  { id: 3, counselor: "Dr. Amanda White", specialization: "Stress Management", date: "2024-03-02", time: "11:00 AM", available: false },
  { id: 4, counselor: "Dr. Sarah Lee", specialization: "Academic Support", date: "2024-03-02", time: "03:00 PM", available: true },
];

export const labEquipment = [
  { id: 1, name: "Oscilloscope", lab: "Electronics Lab", quantity: 15, available: 12, condition: "good" },
  { id: 2, name: "Multimeter", lab: "Electronics Lab", quantity: 30, available: 28, condition: "good" },
  { id: 3, name: "Arduino Kit", lab: "Embedded Systems Lab", quantity: 25, available: 20, condition: "good" },
  { id: 4, name: "Raspberry Pi", lab: "IoT Lab", quantity: 20, available: 15, condition: "fair" },
  { id: 5, name: "3D Printer", lab: "Fabrication Lab", quantity: 5, available: 3, condition: "good" },
];

export const sportsEquipment = [
  { id: 1, item: "Cricket Bat", available: 8, total: 10, deposit: "$5" },
  { id: 2, item: "Football", available: 5, total: 8, deposit: "$3" },
  { id: 3, item: "Badminton Racket", available: 12, total: 15, deposit: "$4" },
  { id: 4, item: "Basketball", available: 4, total: 6, deposit: "$3" },
  { id: 5, item: "Tennis Racket", available: 6, total: 8, deposit: "$5" },
];

export const clubMemberships = [
  { id: 1, name: "Coding Club", members: 156, activities: "Weekly contests, Hackathons", lead: "Alex Turner" },
  { id: 2, name: "Robotics Society", members: 89, activities: "Robot building, Competitions", lead: "Maria Garcia" },
  { id: 3, name: "AI/ML Club", members: 124, activities: "Research projects, Workshops", lead: "Chris Lee" },
  { id: 4, name: "Cybersecurity Club", members: 67, activities: "CTF events, Seminars", lead: "Jordan Smith" },
  { id: 5, name: "Design Club", members: 93, activities: "UI/UX workshops, Portfolios", lead: "Emma Wilson" },
];
