export const MEMBER_COLORS = {
    'irene': '#F8C8DC', 'seulgi': '#FFFACD', 'wendy': '#A7C7E7', 'joy': '#C1E1C1', 'yeri': '#D8BFD8',
    'iu': '#E6E6FA',
    'karina': '#ADD8E6', 'giselle': '#F5F5F5', 'winter': '#E0FFFF', 'ningning': '#FFB6C1'
};

export const GROUP_ABBR = { 'Red Velvet': 'RV', 'IU': 'IU', 'aespa': 'AE' };
export const GROUP_ORDER = ['Red Velvet', 'IU', 'aespa'];
export const MEMBER_ORDER = ['Irene', 'Seulgi', 'Wendy', 'Joy', 'Yeri', 'IU', 'Karina', 'Giselle', 'Winter', 'Ningning'];

export const ARTIST_DATA = {
    "Red Velvet": {
        members: ["Irene", "Seulgi", "Wendy", "Joy", "Yeri"],
        albums: ["Ice Cream Cake", "The Red", "The Velvet", "Russian Roulette", "Rookie", "The Red Summer", "Perfect Velvet", "The Perfect Red Velvet", "Summer Magic", "#Cookie Jar", "RBB", "Sappy", "The ReVe Festival: Day 1", "The ReVe Festival: Day 2", "The ReVe Festival: Finale", "Queendom", "Bloom", "The ReVe Festival 2022 - Feel My Rhythm", "The ReVe Festival 2022 - Birthday", "Chill Kill", "Cosmic", "Like a Flower", "28 Reasons", "Accidentally on Purpose", "Like Water", "Wish You Hell", "Hello", "Monster", "Naughty", "Tilt"]
    },
    "IU": {
        members: ["IU"],
        albums: ["Lost and Found", "Growing Up", "IU...IM", "Real", "Real+", "Last Fantasy", "Spring of a Twenty Year Old", "Modern Times", "Modern Times - Epilogue", "A Flower Bookmark", "Chat-Shire", "Palette", "A Flower Bookmark 2", "Love Poem", "Lilac", "Pieces", "The Winning"]
    },
    "aespa": {
        members: ["Karina", "Giselle", "Winter", "Ningning"],
        albums: ["Savage", "Girls", "My World", "Drama", "Armageddon", "Whiplash"]
    }
};

export const COUNTRY_LIST = ["Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cabo Verde","Cambodia","Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo, Democratic Republic of the","Congo, Republic of the","Costa Rica","Cote d'Ivoire","Croatia","Cuba","Cyprus","Czechia","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palau","Palestine State","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States of America","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"];

export const ADMIN_PASSWORD = "4649";

export function darkenColor(hex, percent) {
    if (!hex || hex.length < 7) return '#000000';
    let R = parseInt(hex.substring(1,3),16);
    let G = parseInt(hex.substring(3,5),16);
    let B = parseInt(hex.substring(5,7),16);

    R = parseInt(R * (100 - percent) / 100);
    G = parseInt(G * (100 - percent) / 100);
    B = parseInt(B * (100 - percent) / 100);

    R = (R<255)?R:255;  
    G = (G<255)?G:255;  
    B = (B<255)?B:255;  

    const RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
    const GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
    const BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

    return "#"+RR+GG+BB;
}

export function calculateDiscountedPrice(price, type) {
    const percentage = type === 'sale' ? 0.10 : 0.20;
    let discountAmount = price * percentage;
    if (discountAmount < 0.50) {
        discountAmount = 0.50;
    }
    const newPrice = price - discountAmount;
    return Math.ceil(newPrice * 2) / 2;
}
