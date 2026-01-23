const fs = require("fs");
const path = require("path");

// Створюємо простий HTML який можна відкрити в браузері для генерації іконок
const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Generate PWA Icons</title>
</head>
<body>
    <h2>Генерація іконок для PWA</h2>
    <p>1. Клацніть правою кнопкою на кожній іконці нижче</p>
    <p>2. Оберіть "Зберегти зображення як..."</p>
    <p>3. Збережіть як icon-192.png та icon-512.png в папку public/</p>
    <br>
    
    <h3>icon-192.png (192x192)</h3>
    <canvas id="canvas192" width="192" height="192"></canvas>
    <br><br>
    
    <h3>icon-512.png (512x512)</h3>
    <canvas id="canvas512" width="512" height="512"></canvas>

    <script>
        function drawIcon(canvas) {
            const ctx = canvas.getContext('2d');
            const size = canvas.width;
            
            // Градієнтний фон
            const gradient = ctx.createLinearGradient(0, 0, size, size);
            gradient.addColorStop(0, '#6366f1');
            gradient.addColorStop(1, '#8b5cf6');
            
            // Заокруглений прямокутник (фон)
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.roundRect(0, 0, size, size, size * 0.2);
            ctx.fill();
            
            // Іконка долара
            ctx.fillStyle = 'white';
            ctx.font = \`bold \${size * 0.5}px Arial\`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('₴', size / 2, size / 2);
        }

        drawIcon(document.getElementById('canvas192'));
        drawIcon(document.getElementById('canvas512'));
        
        // Автоматичне збереження (опціонально)
        setTimeout(() => {
            ['canvas192', 'canvas512'].forEach(id => {
                const canvas = document.getElementById(id);
                const link = document.createElement('a');
                const size = id === 'canvas192' ? '192' : '512';
                link.download = \`icon-\${size}.png\`;
                link.href = canvas.toDataURL();
                document.body.appendChild(link);
            });
            console.log('Іконки готові до завантаження!');
        }, 100);
    </script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, "../public/generate-icons.html"), html);
console.log("✅ Файл generate-icons.html створено в public/");
console.log(
  "📱 Відкрийте public/generate-icons.html в браузері для генерації іконок",
);
