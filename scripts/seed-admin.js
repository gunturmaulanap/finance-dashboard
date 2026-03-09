const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedAdmin() {
  const email = 'superadmin@domain.com';
  const password = 'password';

  console.log('Seeding superadmin account...');

  // Create user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    console.error('Error creating user:', authError.message);
    return;
  }

  const userId = authData.user.id;
  console.log('Superadmin created in Auth. ID:', userId);

  // Note: users_role is usually automatically seeded by a trigger, but we'll do it manually here
  // if you don't use triggers. Let's do it manually.
  const { error: roleError } = await supabase
    .from('users_role')
    .insert([{ user_id: userId, role: 'superadmin' }]);

  if (roleError) {
    console.error('Error assigning superadmin role:', roleError.message);
  } else {
    console.log('Role added successfully.');
  }

  console.log('Done.');
}

seedAdmin();
