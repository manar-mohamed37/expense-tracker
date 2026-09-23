// كود ذكي ومطور لرسم مخطط بياني ملون متكامل بدون مكتبات خارجية
window.Chart = class Chart {
    constructor(ctx, config) {
        this.ctx = ctx;
        this.config = config;
        this.render();
    }

    render() {
        const canvas = this.ctx.canvas || this.ctx;
        const context = canvas.getContext('2d');
        if (!context) return;

        context.clearRect(0, 0, canvas.width, canvas.height);

        const data = this.config.data.datasets[0].data;
        const total = data.reduce((sum, val) => sum + val, 0);
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(canvas.width, canvas.height) / 2.8;

        // إذا لم تكن هناك مصاريف بعد، ارسم دائرة رمادية فارغة
        if (total === 0) {
            context.beginPath();
            context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            context.fillStyle = '#e2e8f0';
            context.fill();
            context.fillStyle = '#64748b';
            context.font = '14px Tajawal';
            context.textAlign = 'center';
            context.fillText('لا توجد مصاريف لعرضها', centerX, centerY);
            return;
        }

        const colors = this.config.data.datasets[0].backgroundColor;
        let startAngle = 0;

        // رسم الأقسام الملونة ديناميكياً حسب حجم المصروف
        data.forEach((value, index) => {
            if (value > 0) {
                const sliceAngle = (value / total) * 2 * Math.PI;

                context.beginPath();
                context.moveTo(centerX, centerY);
                context.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
                context.closePath();

                context.fillStyle = colors[index];
                context.fill();

                startAngle += sliceAngle;
            }
        });

        // رسم دائرة بيضاء بالمنتصف لتصميم الـ Donut العصري
        context.beginPath();
        context.arc(centerX, centerY, radius * 0.5, 0, 2 * Math.PI);
        context.fillStyle = '#ffffff';
        context.fill();
    }

    destroy() {}
};