const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function inspectData() {
    console.log("📊 [INSPECTION] Checking Employee Data...");

    const { data, error } = await supabase
        .from('employees')
        .select('id, employee_id, name, status, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error("❌ Error fetching employees:", error.message);
        return;
    }

    console.table(data);
}

inspectData();
