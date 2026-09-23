// 1. جلب عناصر واجهة المستخدم (DOM Elements)
const balance = document.getElementById('balance');
const money_plus = document.getElementById('money-plus');
const money_minus = document.getElementById('money-minus');
const list = document.getElementById('list');
const form = document.getElementById('form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');
const category = document.getElementById('category');

// 2. جلب البيانات من الـ LocalStorage (إذا كانت موجودة) أو بدء مصفوفة فارغة
const localStorageTransactions = JSON.parse(localStorage.getItem('transactions'));
let transactions = localStorage.getItem('transactions') !== null ? localStorageTransactions : [];

// 3. متغير عام للاحتفاظ بنسخة من الرسم البياني
let expenseChart;

// 4. دالة لإضافة معاملة جديدة عند إرسال النموذج (Form)
function addTransaction(e) {
    e.preventDefault();

    // التحقق من المدخلات
    if (text.value.trim() === '' || amount.value.trim() === '') {
        alert('من فضلك أدخل البيان والمبلغ المعني');
        return;
    }

    // إنشاء كائن المعاملة الجديدة
    const transaction = {
        id: generateID(),
        text: text.value,
        amount: +amount.value, // تحويل النص إلى رقم باستخدام علامة +
        category: category.value
    };

    // إضافة المعاملة إلى المصفوفة
    transactions.push(transaction);

    // تحديث الواجهة والذاكرة المحلية
    addTransactionDOM(transaction);
    updateValues();
    updateLocalStorage();
    updateChart();

    // إعادة تعيين الحقول في الاستمارة
    text.value = '';
    amount.value = '';
    category.value = 'income';
}

// توليد معرف عشوائي فريد لكل معاملة
function generateID() {
    return Math.floor(Math.random() * 100000000);
}

// 5. دالة لعرض المعاملة داخل قائمة السجل في صفحة HTML
function addTransactionDOM(transaction) {
    // تحديد الإشارة (موجب للدخل، سالب للمصروف)
    const sign = transaction.amount < 0 ? '-' : '+';
    const item = document.createElement('li');

    // إضافة الكلاس المناسب للتنسيق اللوني بناءً على القيمة
    item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');

    // بناء الهيكل الداخلي لعنصر القائمة مع زر الحذف والأيقونة المناسبة للـ Category
    item.innerHTML = `
        <span>${transaction.text} <small style="color: #64748b; font-size:0.75rem;">(${getCategoryName(transaction.category)})</small></span>
        <span>${sign}${Math.abs(transaction.amount)} ج.م
            <button class="delete-btn" onclick="removeTransaction(${transaction.id})"><i class="fa-solid fa-trash"></i></button>
        </span>
    `;

    list.appendChild(item);
}

// دالة مساعدة لتحويل اسم الفئة البرمجي إلى اسم مفهوم بالعربية
function getCategoryName(cat) {
    const categories = {
        income: 'دخل',
        food: 'طعام',
        bills: 'فواتير',
        transport: 'مواصلات',
        entertainment: 'ترفيه'
    };
    return categories[cat] || cat;
}

// 6. دالة لحساب وتحديث الإجماليات (الميزانية، الدخل، المصاريف)
function updateValues() {
    const amounts = transactions.map(transaction => transaction.amount);

    // حساب الميزانية الكلية
    const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);

    // حساب إجمالي الدخل (الأرقام الموجبة فقط)
    const income = amounts
        .filter(item => item > 0)
        .reduce((acc, item) => (acc += item), 0)
        .toFixed(2);

    // حساب إجمالي المصاريف (الأرقام السالبة فقط)
    const expense = (
        amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0) * -1
    ).toFixed(2);

    // عرض القيم في عناصر الـ HTML (تم تصحيح النص هنا)
    balance.innerText = `${total}ج.م`;
    money_plus.innerText = `+${income} ج.م`;
    money_minus.innerText = `-${expense} ج.م`;
}

// 7. دالة لحذف معاملة عن طريق الـ ID الخاص بها
function removeTransaction(id) {
    transactions = transactions.filter(transaction => transaction.id !== id);

    updateLocalStorage();
    init(); // إعادة تشغيل التطبيق لتحديث الشاشة بعد الحذف
}

// 8. دالة لتحديث الـ LocalStorage بآخر البيانات
function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// 9. دالة لتحديث الرسم البياني (Chart.js) بناءً على الفئات ومجموعها
function updateChart() {
    // حساب مجموع المصاريف لكل فئة على حدة
    const categoriesTotals = { food: 0, bills: 0, transport: 0, entertainment: 0 };

    transactions.forEach(t => {
        if (t.amount < 0 && categoriesTotals[t.category] !== undefined) {
            categoriesTotals[t.category] += Math.abs(t.amount);
        }
    });

    const chartData = [
        categoriesTotals.food,
        categoriesTotals.bills,
        categoriesTotals.transport,
        categoriesTotals.entertainment
    ];

    const ctx = document.getElementById('expenseChart').getContext('2d');

    // إذا كان الرسم البياني موجوداً مسبقاً، نقوم بتدميره لإنشاء واحد جديد بالبيانات المحدثة
    if (expenseChart) {
       // expenseChart.destroy();
    }

    // إنشاء الرسم البياني الدائري (Pie Chart)
    expenseChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['طعام ومشتريات', 'فواتير وخدمات', 'مواصلات وتنقل', 'ترفيه وتسوق'],
            datasets: [{
                data: chartData,
                backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#ec4899'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { font: { family: 'Tajawal' } }
                }
            }
        }
    });
}

// 10. دالة بدء وتشغيل التطبيق (Initialization)
function init() {
    list.innerHTML = '';
    transactions.forEach(addTransactionDOM);
    updateValues();
    updateChart();
}

// تشغيل التطبيق لأول مرة عند فتح الصفحة
init();

// الاستماع لحدث الضغط على زر إضافة المعاملة
form.addEventListener('submit', addTransaction);
// جلب زر مسح الكل من الـ HTML
const clearBtn = document.getElementById('clear-btn');

// دالة لمسح كافة البيانات
function clearAllTransactions() {
    if (confirm('هل أنت متأكد من رغبتك في مسح جميع المعاملات والسجل بالكامل؟')) {
        transactions = []; // تفريغ مصفوفة البيانات
        updateLocalStorage(); // تحديث الذاكرة المحلية لتصبح فارغة
        init(); // إعادة تشغيل التطبيق لتحديث الشاشة فوراً
    }
}

// الاستماع لحدث الضغط على زر مسح الكل
if (clearBtn) {
    clearBtn.addEventListener('click', clearAllTransactions);
}
// جلب عناصر زر التبديل من الـ DOM
const themeToggle = document.getElementById('theme-toggle');

// التحقق من الاختيار السابق للمستخدم في الـ LocalStorage
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-theme');
    if (themeToggle) themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i> الوضع الفاتح';
}

// دالة تبديل الثيم
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    
    if (document.body.classList.contains('dark-theme')) {
        localStorage.setItem('theme', 'dark');
        themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i> الوضع الفاتح';
    } else {
        localStorage.setItem('theme', 'light');
        themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i> الوضع الداكن';
    }
    
    // إعادة رسم المخطط ليتناسب مع الألوان الجديدة
    updateChart();
}

// الاستماع لضغط الزر
if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
}