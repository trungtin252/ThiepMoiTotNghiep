/**
 * SERVER NODE.JS THUẦN (KHÔNG CẦN CÀI THÊM THƯ VIỆN NPM)
 * Chạy lệnh: node server.js
 * Mở trình duyệt: http://localhost:3000
 * Tự động ghi lời chúc vào file: wishes.json ngay trong thư mục này!
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const WISHES_FILE = path.join(ROOT, 'wishes.json');

// Đảm bảo file wishes.json luôn tồn tại
if (!fs.existsSync(WISHES_FILE)) {
  fs.writeFileSync(WISHES_FILE, '[]', 'utf8');
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = decodeURIComponent(parsedUrl.pathname);

  // Thêm CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API ĐỌC & GHI LỜI CHÚC VÀO FILE WISHES.JSON
  if (pathname === '/api/wishes') {
    if (req.method === 'GET') {
      try {
        const data = fs.readFileSync(WISHES_FILE, 'utf8') || '[]';
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(data);
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Không đọc được file wishes.json' }));
      }
      return;
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
      });

      req.on('end', () => {
        try {
          const newWish = JSON.parse(body);
          let wishes = [];
          if (fs.existsSync(WISHES_FILE)) {
            try {
              wishes = JSON.parse(fs.readFileSync(WISHES_FILE, 'utf8') || '[]');
            } catch (e) {
              wishes = [];
            }
          }

          // Thêm lời chúc mới lên đầu danh sách
          wishes.unshift({
            name: newWish.name || 'Khách mời',
            message: newWish.message || '',
            time: newWish.time || new Date().toLocaleString('vi-VN'),
            timestamp: newWish.timestamp || Date.now()
          });

          // Ghi đè vào file wishes.json
          fs.writeFileSync(WISHES_FILE, JSON.stringify(wishes, null, 2), 'utf8');

          console.log(`[LỜI CHÚC MỚI] Từ "${newWish.name}": "${newWish.message}" -> Đã ghi vào wishes.json`);

          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: true, count: wishes.length }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Dữ liệu không hợp lệ' }));
        }
      });
      return;
    }
  }

  // PHỤC VỤ STATIC FILES
  let filePath = path.join(ROOT, pathname);

  // Nếu truy cập root -> index.html
  if (pathname === '/' || pathname === '') {
    filePath = path.join(ROOT, 'index.html');
  }

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    // Nếu đường dẫn là file html không có đuôi (vd /tao-link -> tao-link.html)
    const htmlPath = filePath + '.html';
    if (fs.existsSync(htmlPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(htmlPath).pipe(res);
      return;
    }

    // Rewrite URL cá nhân hóa (vd /anh-nam -> index.html)
    const indexPath = path.join(ROOT, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(indexPath).pipe(res);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  THIỆP MỜI TỐT NGHIỆP - TÂN KỸ SƯ LAI TRUNG TÍN       `);
  console.log(`  Server đang chạy tại: http://localhost:${PORT}        `);
  console.log(`  File lưu lời chúc:    ${WISHES_FILE}                  `);
  console.log(`  Trang tạo link:       http://localhost:${PORT}/tao-link.html `);
  console.log(`=======================================================`);
});
