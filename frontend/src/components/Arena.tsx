import { useEffect, useRef, useState } from 'react';

const PLAYER_COLORS = [
  '#FFD700', // gold - player
  '#E63946', // red
  '#2A9D8F', // teal
  '#4361EE', // blue
  '#F72585', // magenta
  '#7209B7', // purple
  '#FB5607', // orange
  '#06D6A0', // mint
];

function addressToColor(address: string): string {
  let h = 0;
  const s = (address || '').toLowerCase();
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i) | 0;
  return PLAYER_COLORS[Math.abs(h) % PLAYER_COLORS.length];
}

function addressToColors(address: string): [string, string] {
  let h = 0;
  const s = (address || '').toLowerCase();
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i) | 0;
  const idx = Math.abs(h) % PLAYER_COLORS.length;
  const color1 = PLAYER_COLORS[idx];
  const color2 = PLAYER_COLORS[(idx + 4) % PLAYER_COLORS.length];
  return [color1, color2];
}

const PIZZADAO_SVG_PATH = 'M91.6585 9.8024C85.7871 6.91431 79.5202 8.48774 73.8124 11.2896C69.0768 6.26875 62.9425 2.78585 56.2043 1.29217C49.4661 -0.201515 42.4346 0.362868 36.021 2.91219C29.6073 5.46151 24.107 9.87826 20.2329 15.5901C16.3588 21.302 14.2894 28.0457 14.2928 34.9475C14.2975 36.4326 14.3968 37.9158 14.5902 39.3882C8.99846 41.4464 3.9272 44.8223 1.62208 50.4647C-1.1738 56.9011 4.78976 61.9218 10.9437 61.8386C25.0919 61.1353 36.2273 50.8524 46.2978 41.5528L46.2984 41.5523C47.3022 40.6254 48.2954 39.7081 49.28 38.8112C50.3113 37.8434 51.344 36.8617 52.3818 35.8751C58.7147 29.8546 65.2379 23.6531 72.8008 19.339L72.7977 19.3329C74.463 18.3207 76.2105 17.4506 78.0219 16.7317L78.3909 16.5853L78.394 16.5923C79.5742 16.1205 80.7758 15.7038 81.9948 15.3436C84.0055 14.7933 89.6984 14.02 88.9132 17.4018V17.39C87.4445 20.778 84.793 22.7244 81.7231 24.0827L81.7274 24.0922L79.2005 25.1226L76.4705 25.9697C77.2919 28.5003 77.7661 31.1429 77.8704 33.8253C78.074 39.0604 76.861 44.2535 74.3593 48.8566C71.8576 53.4598 68.16 57.3025 63.6565 59.9795C59.153 62.6564 54.0105 64.0683 48.7714 64.0663C42.4836 64.0663 34.6641 62.365 33.0431 59.8309L28.534 62.716C31.9188 68.0074 42.8465 69.4202 48.7595 69.4202C53.6348 69.4235 58.4553 68.3925 62.9027 66.3951C67.3501 64.3977 71.323 61.4795 74.5592 57.8332C77.7954 54.1868 80.2211 49.8954 81.6762 45.2423C83.1312 40.5892 83.5825 35.6803 83.0002 30.8399C88.6931 28.517 93.7078 24.6771 95.4538 18.5618C96.4442 14.7933 95.076 11.6733 91.6585 9.8024ZM11.6486 55.2712C7.63918 55.5389 6.29478 53.091 9.3881 50.3963C11.3094 48.479 13.58 46.9473 16.0774 45.8842C16.9293 48.4391 18.0825 50.8834 19.5128 53.1654C17.034 54.3256 14.3696 55.0386 11.6427 55.2712H11.6486ZM39.5271 38.2133C37.7924 39.4739 36.2261 40.9511 34.8661 42.609C34.5788 42.3039 34.3541 41.9454 34.2049 41.5537C34.055 41.1606 33.9841 40.7419 33.9961 40.3214C34.0204 39.4721 34.381 38.6673 34.9987 38.084C35.6164 37.5006 36.4405 37.1865 37.2897 37.2108C38.139 37.235 38.9438 37.5957 39.5271 38.2133ZM39.6402 28.053C38.9885 28.0536 38.3513 27.8612 37.8089 27.5C37.2657 27.1382 36.842 26.6235 36.5914 26.0209C36.3409 25.4182 36.2747 24.7548 36.4013 24.1146C36.5279 23.4743 36.8416 22.886 37.3027 22.4241C37.7637 21.9622 38.3515 21.6475 38.9915 21.5197C39.6315 21.3919 40.295 21.4569 40.8981 21.7064C41.5012 21.9559 42.0167 22.3787 42.3794 22.9212C42.7421 23.4638 42.9357 24.1018 42.9357 24.7544C42.9361 25.1877 42.8511 25.6168 42.6854 26.0172C42.5198 26.4176 42.2769 26.7814 41.9705 27.0877C41.6641 27.3941 41.3003 27.6371 40.9 27.8027C40.5005 27.9679 40.0724 28.053 39.6402 28.053ZM53.2894 24.8615C53.016 24.5414 52.8083 24.1706 52.6782 23.7702C52.5481 23.3699 52.4981 22.9478 52.5311 22.5281C52.5641 22.1085 52.6795 21.6994 52.8706 21.3243C53.0617 20.9492 53.3248 20.6154 53.6449 20.342C54.2913 19.7898 55.1307 19.517 55.9782 19.5837C56.3979 19.6167 56.807 19.732 57.1821 19.9231C57.5572 20.1142 57.891 20.3773 58.1644 20.6974C56.3687 21.8722 54.7305 23.2716 53.2894 24.8615ZM65.7995 15.9712C65.0559 16.4768 64.589 16.6255 63.7859 15.9712C59.9758 12.8541 55.5797 11.1438 50.675 10.5906C48.1246 10.3034 45.5443 10.4431 43.0398 11.004C43.4523 11.3688 43.7668 11.8311 43.9546 12.3487C44.1424 12.8664 44.1976 13.4228 44.1149 13.9672C44.0323 14.5116 43.8146 15.0266 43.4817 15.4652C43.1488 15.9038 42.7113 16.252 42.2092 16.478C41.7071 16.704 41.1563 16.8005 40.6073 16.7589C40.0582 16.7172 39.5283 16.5386 39.0661 16.2394C38.6038 15.9403 38.2239 15.53 37.961 15.0462C37.6981 14.5624 37.5606 14.0204 37.5611 13.4698C37.5618 13.2883 37.5777 13.1072 37.6087 12.9284C32.4281 15.5028 28.2911 19.7815 25.8927 25.0459C26.026 25.0294 26.16 25.0205 26.2943 25.0191C26.8257 25.0233 27.3482 25.1558 27.8174 25.4053C28.2866 25.6548 28.6886 26.014 28.9891 26.4523C29.2896 26.8906 29.4797 27.395 29.5434 27.9226C29.607 28.4502 29.5422 28.9854 29.3545 29.4826C29.1668 29.9797 28.8618 30.4242 28.4654 30.7781C28.069 31.1321 27.5929 31.385 27.0777 31.5153C26.5626 31.6457 26.0235 31.6497 25.5065 31.5269C24.9894 31.4041 24.5097 31.1583 24.1081 30.8102C23.8304 32.4604 23.7307 34.1356 23.8107 35.8071C23.8107 35.8071 24.1319 40.5839 25.8481 44.2096C26.2455 45.0514 26.5841 45.7095 26.8543 46.2348C27.4201 47.3345 27.6864 47.8521 27.5663 48.2543C27.4594 48.6119 27.047 48.8781 26.2679 49.3812L26.2021 49.4236C25.5566 49.8401 24.9053 50.2505 24.242 50.6521C20.3884 44.6464 18.8746 37.4346 19.9882 30.3864C21.1018 23.3381 24.7652 16.9443 30.2826 12.4192C35.8 7.89419 42.7872 5.55306 49.9171 5.84049C57.047 6.12792 63.823 9.02388 68.9583 13.9784C67.8667 14.6446 66.8108 15.3228 65.7995 15.9831V15.9712ZM67.4744 50.054C66.9247 49.9806 66.4024 49.7697 65.9559 49.4408C65.5094 49.1119 65.1532 48.6756 64.9201 48.1724C64.687 47.6692 64.5847 47.1153 64.6226 46.5621C64.6605 46.0088 64.8375 45.474 65.137 45.0073C65.4365 44.5406 65.849 44.1571 66.3362 43.8921C66.8234 43.6272 67.3695 43.4895 67.9241 43.4918C68.4787 43.4941 69.0237 43.6363 69.5087 43.9052C69.9936 44.1742 70.4029 44.5611 70.6986 45.0303C72.2672 41.7524 73.0232 38.1449 72.9026 34.513V34.1472C72.8573 34.0251 72.8254 33.8984 72.8074 33.7694C72.7868 33.6084 72.7664 33.4473 72.7461 33.2864L72.7457 33.2828C72.4736 31.1259 72.2034 28.9832 71.1715 27.0771L70.9008 27.1723C68.2924 29.0938 65.8058 31.1401 63.3817 33.2549C63.8678 33.4904 64.2887 33.8418 64.6071 34.2781C64.9255 34.7145 65.1318 35.2224 65.2077 35.7572C65.2837 36.292 65.2271 36.8373 65.0428 37.3451C64.8585 37.8529 64.5522 38.3076 64.1509 38.6691C63.7496 39.0307 63.2655 39.2881 62.7414 39.4187C62.2172 39.5492 61.669 39.5489 61.1449 39.4178C60.6209 39.2866 60.1371 39.0287 59.7362 38.6667C59.3353 38.3046 59.0295 37.8496 58.8458 37.3416C57.1645 38.8988 55.501 40.4749 53.8373 42.0513L53.8373 42.0514C48.5287 47.0814 43.2169 52.1144 37.3086 56.544C47.9032 62.1744 60.4609 58.4773 67.4744 50.054ZM51.6271 48.4686C52.2796 48.4686 52.9175 48.6622 53.46 49.0247C54.0025 49.3873 54.4253 49.9027 54.6748 50.5056C54.9244 51.1085 54.9896 51.7719 54.862 52.4118C54.7345 53.0517 54.4201 53.6395 53.9585 54.1007C53.4969 54.5619 52.9088 54.8758 52.2688 55.0027C51.6287 55.1297 50.9654 55.0639 50.3627 54.8138C49.7601 54.5637 49.2451 54.1404 48.883 53.5976C48.5209 53.0548 48.328 52.4167 48.3285 51.7642C48.3293 50.8899 48.6772 50.0517 49.2957 49.4337C49.9142 48.8158 50.7528 48.4686 51.6271 48.4686Z';

function svgDataUrl(color: string): string {
  const svg = `<svg width="96" height="70" viewBox="0 0 96 70" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="${PIZZADAO_SVG_PATH}" fill="${color}"/></svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

function svgDataUrlTwoTone(color1: string, color2: string): string {
  const svg = `<svg width="96" height="70" viewBox="0 0 96 70" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${color1}"/><stop offset="100%" stop-color="${color2}"/></linearGradient></defs><path fill-rule="evenodd" clip-rule="evenodd" d="${PIZZADAO_SVG_PATH}" fill="url(#g)"/></svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

const OLIVE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 190.421 235.502"><path fill="#677718" stroke="#000" stroke-width="2.8" d="M158.883 26.7c-4.353-6.177-8.48-12.308-18.077-16.718c-11.525-5.298-27.438-8.574-45.01-8.574c-19.566 0-37.065 4.064-48.751 10.455c-6.453 3.53-9.659 7.992-13.391 12.431C13.907 46.22 1.407 78.487 1.407 114.495c0 66.052 41.997 119.6 93.803 119.6c51.807 0 93.804-53.548 93.804-119.6C189.014 79.787 177.405 48.547 158.883 26.7z"/><ellipse fill="#C0272D" stroke="#000" stroke-width="2.9" cx="95.624" cy="33.472" rx="49.87" ry="21.863"/><path fill="#B1B579" d="M34.438 33.504C18.344 54.144 8.412 82.353 8.412 113.48c0 63.267 40.958 114.553 91.485 114.553c3.979 0 7.887-.354 11.734-.973c-49.668-1.237-89.636-52.003-89.636-114.491c0-26.157 7.012-50.252 18.802-69.53L34.438 33.504z"/></svg>`;

const PEPPERONI_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><style>.cls-1{fill:#be3333;}.cls-2{fill:#e1a0a0;}</style></defs><circle class="cls-1" cx="16" cy="16" r="14"/><path class="cls-2" d="M12 10.14a1 1 0 0 1-.71-1.71l1.14-1.14a1 1 0 0 1 1.41 1.41L12.71 9.85A1 1 0 0 1 12 10.14Z"/><path class="cls-2" d="M7.43 17.57a1 1 0 0 1-.71-1.71l1.14-1.14a1 1 0 1 1 1.41 1.41L8.14 17.28A1 1 0 0 1 7.43 17.57Z"/><path class="cls-2" d="M15.43 17.57a1 1 0 0 1-.71-1.71l1.14-1.14a1 1 0 1 1 1.41 1.41l-1.14 1.14A1 1 0 0 1 15.43 17.57Z"/><path class="cls-2" d="M23.43 17.57a1 1 0 0 1-.71-1.71l1.14-1.14a1 1 0 1 1 1.41 1.41l-1.14 1.14A1 1 0 0 1 23.43 17.57Z"/><path class="cls-2" d="M20 10.14a1 1 0 0 1-.71-1.71l1.14-1.14a1 1 0 0 1 1.41 1.41L20.71 9.85A1 1 0 0 1 20 10.14Z"/><path class="cls-2" d="M12 25a1 1 0 0 1-.71-1.71l1.14-1.14a1 1 0 0 1 1.41 1.41l-1.14 1.14A1 1 0 0 1 12 25Z"/><path class="cls-2" d="M20 25a1 1 0 0 1-.71-1.71l1.14-1.14a1 1 0 0 1 1.41 1.41l-1.14 1.14A1 1 0 0 1 20 25Z"/></svg>`;

const PINEAPPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><style>.cls-1{fill:#fddc49;}.cls-2{fill:#e8c631;}</style></defs><path class="cls-1" d="M16 3A13 13 0 1 0 29 16 13 13 0 0 0 16 3Zm2.83 15.83L16 20l-2.83-1.17L12 16l1.17-2.83L16 12l2.83 1.17L20 16Z"/><path class="cls-2" d="M16 27.5a.5.5 0 0 1-.5-.5V22a.5.5 0 1 1 1 0v5a.5.5 0 0 1-1 .5Z"/><path class="cls-2" d="M16 10.49a.5.5 0 0 1-.5-.5V5a.5.5 0 0 1 1 0v5a.5.5 0 0 1-1 .5Z"/><path class="cls-2" d="M10 16.5H5a.5.5 0 0 1 0-1h5a.5.5 0 1 1 0 1Z"/><path class="cls-2" d="M27 16.5H22a.5.5 0 1 1 0-1h5a.5.5 0 0 1 0 1Z"/><path class="cls-2" d="M11.75 12.25a.5.5 0 0 1-.35-.15L7.87 8.58a.5.5 0 0 1 .71-.71L12.1 11.4a.5.5 0 0 1-.35.85Z"/><path class="cls-2" d="M23.78 24.28a.5.5 0 0 1-.35-.15L19.9 20.6a.5.5 0 0 1 .71-.71l3.53 3.53a.5.5 0 0 1-.35.85Z"/><path class="cls-2" d="M8.22 24.28a.5.5 0 0 1-.35-.85L11.4 19.9a.5.5 0 0 1 .71.71L8.58 24.13A.5.5 0 0 1 8.22 24.28Z"/><path class="cls-2" d="M20.25 12.25a.5.5 0 0 1-.35-.85l3.53-3.53a.5.5 0 0 1 .71.71L20.6 12.1a.5.5 0 0 1-.35.15Z"/></svg>`;

const CHEESE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="#F3AF1A" d="M35.70206 248.785503s23.001723 11.924206 34.361469 20.532212c14.534831 10.936402 118.042583 65.195066 103.29608 192.339558-7.055743 47.202922-56.234273 141.255977-144.642734 158.189761-0.141115 2.257838 0 0 0 0s236.367395 24.695101 219.574726-190.998967C242.011989 369.015366 218.304692 266.848205 66.606215 249.914422c-24.201199-1.128919-30.904155-1.128919-30.904155-1.128919z"/><path fill="#F3AF1A" d="M35.70206 248.785503L583.368842 170.043409l220.915317 48.190726L66.676773 249.914422z"/><path fill="#F4C323" d="M35.70206 248.785503l768.582099-30.551368s217.81079 244.622614-46.42679 542.727761H658.794736s12.065321-60.891063-50.236891-69.640184c-27.446841-3.316199-77.683732 12.700338-64.912837 75.002549-78.318749-1.975608-514.857576-5.997382-514.857576-5.997382v-140.409288s170.255082 19.614966 208.638324-127.638393c7.620203-68.370151 11.148074-211.883966-168.491146-240.741956-15.945979-2.328395-33.23255-2.75174-33.23255-2.751739z"/><path fill="#F6AF1C" d="M757.645697 570.174602m-64.912837 0a64.912837 64.912837 0 1 0 129.825674 0 64.912837 64.912837 0 1 0-129.825674 0Z"/><path fill="#7A4721" d="M692.73286 612.650176c-38.312685 0-69.49907-31.186385-69.49907-69.49907s31.186385-69.49907 69.49907-69.49907 69.49907 31.186385 69.49907 69.49907-31.186385 69.49907-69.49907 69.49907z m0-117.830911c-26.670709 0-48.33184 21.661131-48.33184 48.331841s21.661131 48.33184 48.33184 48.33184 48.33184-21.661131 48.331841-48.33184-21.661131-48.33184-48.331841-48.331841zM399.072831 434.986564c-28.364087 0-51.36581-23.07228-51.36581-51.36581s23.07228-51.36581 51.36581-51.36581 51.36581 23.07228 51.36581 51.36581-23.07228 51.36581-51.36581 51.36581z m0-81.634948c-16.651554 0-30.198581 13.547027-30.19858 30.19858s13.547027 30.198581 30.19858 30.198581 30.198581-13.547027 30.198581-30.198581-13.547027-30.198581-30.198581-30.19858z"/><path fill="#F6AF1C" d="M325.48143 658.018604m-73.5914 0a73.591401 73.591401 0 1 0 147.182801 0 73.591401 73.591401 0 1 0-147.182801 0Z"/><path fill="#F6AF1C" d="M565.941156 416.359402m-67.805691 0a67.805691 67.805691 0 1 0 135.611383 0 67.805691 67.805691 0 1 0-135.611383 0Z"/><path fill="#F6AF1C" d="M793.347757 279.125198m-29.210776 0a29.210777 29.210777 0 1 0 58.421553 0 29.210777 29.210777 0 1 0-58.421553 0Z"/><path fill="#F4C323" d="M876.111624 751.577758h119.171501v89.678495l-25.471232 40.217736h-116.490319l-30.76304-32.174189z"/><path fill="#F3AF1A" d="M969.811893 881.473989l25.471232-40.217736v-44.945084l-48.896299 6.138497-5.362365 36.830979H925.007924l-9.384138 34.149797-1.763936 8.043547z"/></svg>`;

interface Slice {
  x: number;
  y: number;
  size: number;
}

interface Topping {
  x: number;
  y: number;
  toppingId: number;
  eatenAt: number;
}

interface ArenaProps {
  playerSlice: any;
  allSlices: Map<string, Slice>;
  toppings: Topping[];
  onMove: (dx: number, dy: number) => void;
  lastMoveDir?: { dx: number; dy: number };
  playerAddress?: string;
}

const ARENA_RADIUS = 400;
const ARENA_SIZE = 64;
const SCALE = ARENA_RADIUS / (ARENA_SIZE / 2);
const centerX = ARENA_RADIUS;
const centerY = ARENA_RADIUS;
function arenaToCanvas(x: number, y: number) {
  return { x: centerX + x * SCALE, y: centerY + y * SCALE };
}

export function Arena({ playerSlice, allSlices, toppings, onMove, lastMoveDir = { dx: 1, dy: 0 } }: ArenaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const iconCacheRef = useRef<Record<string, HTMLImageElement>>({});
  const oliveImgRef = useRef<HTMLImageElement | null>(null);
  const cheeseImgRef = useRef<HTMLImageElement | null>(null);
  const pepperoniImgRef = useRef<HTMLImageElement | null>(null);
  const pineappleImgRef = useRef<HTMLImageElement | null>(null);
  const [iconsReady, setIconsReady] = useState(false);
  const [oliveReady, setOliveReady] = useState(false);
  const [cheeseReady, setCheeseReady] = useState(false);
  const [pepperoniReady, setPepperoniReady] = useState(false);
  const [pineappleReady, setPineappleReady] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    let loaded = 0;
    const total = PLAYER_COLORS.length;
    PLAYER_COLORS.forEach((color) => {
      const img = new Image();
      img.onload = () => {
        iconCacheRef.current[color] = img;
        loaded++;
        if (loaded === total) setIconsReady(true);
      };
      img.src = svgDataUrl(color);
    });
    const oliveImg = new Image();
    oliveImg.onload = () => {
      oliveImgRef.current = oliveImg;
      setOliveReady(true);
    };
    oliveImg.src = 'data:image/svg+xml,' + encodeURIComponent(OLIVE_SVG);
    const cheeseImg = new Image();
    cheeseImg.onload = () => {
      cheeseImgRef.current = cheeseImg;
      setCheeseReady(true);
    };
    cheeseImg.src = 'data:image/svg+xml,' + encodeURIComponent(CHEESE_SVG);
    const pepperoniImg = new Image();
    pepperoniImg.onload = () => {
      pepperoniImgRef.current = pepperoniImg;
      setPepperoniReady(true);
    };
    pepperoniImg.src = 'data:image/svg+xml,' + encodeURIComponent(PEPPERONI_SVG);
    const pineappleImg = new Image();
    pineappleImg.onload = () => {
      pineappleImgRef.current = pineappleImg;
      setPineappleReady(true);
    };
    pineappleImg.src = 'data:image/svg+xml,' + encodeURIComponent(PINEAPPLE_SVG);
  }, []);
  
  
  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const render = () => {
      // Clear
      ctx.fillStyle = '#000033';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw checkered arena background
      ctx.strokeStyle = '#FF4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ARENA_RADIUS, ARENA_RADIUS, ARENA_RADIUS, 0, Math.PI * 2);
      ctx.stroke();
      
      // Checkered pattern
      const gridSize = 20;
      for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
          const dist = Math.sqrt(
            Math.pow(x - ARENA_RADIUS, 2) + Math.pow(y - ARENA_RADIUS, 2)
          );
          if (dist <= ARENA_RADIUS) {
            const isRed = Math.floor(x / gridSize) % 2 === Math.floor(y / gridSize) % 2;
            ctx.fillStyle = isRed ? 'rgba(255, 68, 68, 0.1)' : 'rgba(255, 215, 0, 0.1)';
            ctx.fillRect(x, y, gridSize, gridSize);
          }
        }
      }
      
      // Draw toppings as distinct pizza ingredients (larger, with glow for visibility)
      const drawTopping = (t: Topping, px: number, py: number) => {
        ctx.save();
        ctx.translate(px, py);
        const id = t.toppingId % 4;
        const size = 18;
        if (id === 0) {
          // Pepperoni - use SVG (red circle with fatty spots)
          const pepperoniImg = pepperoniImgRef.current;
          if (pepperoniImg && pepperoniReady) {
            const w = size * 1.6;
            const h = size * 1.6;
            ctx.drawImage(pepperoniImg, -w / 2, -h / 2, w, h);
          } else {
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#C41E3A';
            ctx.fillStyle = '#8B2500';
            ctx.beginPath();
            ctx.arc(0, 0, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#C41E3A';
            ctx.beginPath();
            ctx.arc(0, 0, size * 0.7, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#FF6B6B';
            ctx.beginPath();
            ctx.arc(-4, -3, 5, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (id === 1) {
          // Cheese - use SVG (swiss cheese wedge)
          const cheeseImg = cheeseImgRef.current;
          if (cheeseImg && cheeseReady) {
            const w = size * 1.8;
            const h = size * 1.8;
            ctx.drawImage(cheeseImg, -w / 2, -h / 2, w, h);
          } else {
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#FFD700';
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.ellipse(0, 0, size, size * 0.7, 0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#FFA500';
            ctx.beginPath();
            ctx.ellipse(3, 5, 8, 5, 0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(255,255,200,0.6)';
            ctx.beginPath();
            ctx.ellipse(-4, -2, 5, 4, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (id === 2) {
          // Olive - use SVG (green olive with pimiento)
          const oliveImg = oliveImgRef.current;
          if (oliveImg && oliveReady) {
            const w = size * 0.9;
            const h = size * 1.2;
            ctx.drawImage(oliveImg, -w / 2, -h / 2, w, h);
          } else {
            ctx.shadowBlur = 6;
            ctx.shadowColor = '#2d5a1a';
            ctx.fillStyle = '#1a3d00';
            ctx.beginPath();
            ctx.ellipse(0, 0, size * 0.55, size * 0.7, 0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.beginPath();
            ctx.ellipse(-4, -4, 4, 5, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
      };

      toppings.forEach((topping) => {
        if (topping.eatenAt === 0) {
          const pos = arenaToCanvas(Number(topping.x), Number(topping.y));
          const dist = Math.sqrt(
            Math.pow(pos.x - ARENA_RADIUS, 2) + Math.pow(pos.y - ARENA_RADIUS, 2)
          );
          if (dist <= ARENA_RADIUS) {
            drawTopping(topping, pos.x, pos.y);
          }
        }
      });
      
      // Draw slices using pizza icon with per-player colors
      const allSlicesArray = Array.from(allSlices.entries());
      const cache = iconCacheRef.current;

      const drawPizzaIcon = (px: number, py: number, radius: number, color: string, faceAngle: number) => {
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(faceAngle);
        const w = radius * 2.2;
        const h = radius * 1.6;
        const img = cache[color];
        if (img && iconsReady) {
          ctx.drawImage(img, -w / 2, -h / 2, w, h);
        } else {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.ellipse(0, 0, radius * 0.8, radius, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      };

      // Draw other players first
      allSlicesArray.forEach(([address, slice]) => {
        const pos = arenaToCanvas(slice.x, slice.y);
        const radius = Math.max(14, Math.min(65, 12 + (slice.size - 1000) / 25));
        const dist = Math.sqrt(
          Math.pow(pos.x - ARENA_RADIUS, 2) + Math.pow(pos.y - ARENA_RADIUS, 2)
        );
        const s = slice as any;
        const faceAngle = Math.atan2((s.lastDy ?? 0), (s.lastDx ?? 1));
        const color = addressToColor(address);
        if (dist <= ARENA_RADIUS + radius) {
          ctx.save();
          ctx.shadowBlur = 15;
          ctx.shadowColor = color;
          drawPizzaIcon(pos.x, pos.y, radius, color, faceAngle);
          ctx.restore();
        }
      });

      // Player is rendered as DOM overlay for reliable SVG display

      animationFrameRef.current = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [playerSlice, allSlices, toppings, lastMoveDir, iconsReady, oliveReady, cheeseReady, pepperoniReady, pineappleReady]);
  
  // Mouse/touch controls
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDragging(true);
    setDragStart({ x, y });
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const dx = x - dragStart.x;
    const dy = y - dragStart.y;
    
    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
      const moveX = dx > 0 ? 1 : -1;
      const moveY = dy > 0 ? 1 : -1;
      onMove(moveX, moveY);
      setDragStart({ x, y });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const waitingToSpawn = !playerSlice || playerSlice.size === 0;

  const canvasSize = ARENA_RADIUS * 2;
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: canvasSize, height: canvasSize, maxWidth: '100%', maxHeight: 'min(88vh, 780px)', aspectRatio: '1' }}>
        {waitingToSpawn && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)',
            borderRadius: '50%',
            zIndex: 10,
            pointerEvents: 'none',
          }}>
            <div style={{ color: '#FFD700', fontFamily: 'Bungee', fontSize: '18px', textAlign: 'center', padding: '20px' }}>
              Press WASD or use Spawn button
            </div>
          </div>
        )}
        <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          width: '100%',
          height: '100%',
          border: '3px solid #FF4444',
          borderRadius: '50%',
          cursor: 'crosshair',
          boxShadow: '0 0 30px #FF4444',
        }}
      />
        {playerSlice && playerSlice.size > 0 && playerSlice.respawn === 0 && (() => {
          const pos = arenaToCanvas(playerSlice.x, playerSlice.y);
          const radius = Math.max(14, Math.min(65, 12 + (playerSlice.size - 1000) / 25));
          const w = radius * 2.2;
          const h = radius * 1.6;
          const deg = (Math.atan2(lastMoveDir.dy, lastMoveDir.dx) * 180 / Math.PI);
          const [color1, color2] = addressToColors(playerSlice.address || playerAddress);
          return (
            <div
              style={{
                position: 'absolute',
                left: `${(pos.x / canvasSize) * 100}%`,
                top: `${(pos.y / canvasSize) * 100}%`,
                width: w,
                height: h,
                pointerEvents: 'none',
                transform: `translate(-50%, -50%) rotate(${deg}deg)`,
                filter: `drop-shadow(0 0 12px ${color1})`,
              }}
            >
              <img
                src={svgDataUrlTwoTone(color1, color2)}
                alt=""
                width={w}
                height={h}
                style={{ display: 'block' }}
              />
            </div>
          );
        })()}
      </div>
    </div>
  );
}
