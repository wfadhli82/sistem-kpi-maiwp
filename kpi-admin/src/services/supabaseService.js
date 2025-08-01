import { supabase } from '../supabase';

// =====================================================
// DEPARTMENTS SERVICE
// =====================================================

export const getDepartments = async () => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching departments:', error);
    throw error;
  }
};

// =====================================================
// KPI CATEGORIES SERVICE
// =====================================================

export const getKPICategories = async () => {
  try {
    const { data, error } = await supabase
      .from('kpi_categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching KPI categories:', error);
    throw error;
  }
};

// =====================================================
// KPI MEASUREMENT TYPES SERVICE
// =====================================================

export const getKPIMeasurementTypes = async () => {
  try {
    const { data, error } = await supabase
      .from('kpi_measurement_types')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching KPI measurement types:', error);
    throw error;
  }
};

// =====================================================
// KPI DATA SERVICE
// =====================================================

// Helper function to map department ID to name (moved outside functions)
function getDepartmentName(departmentId) {
  console.log('🔄 Mapping department ID:', departmentId);
  const departmentMap = {
    1: 'BKP', 2: 'MCP', 3: 'BWP', 4: 'UI', 5: 'UUU', 6: 'BPA', 7: 'MCL', 8: 'UAD',
    9: 'BPPH', 10: 'UKK', 11: 'BPSM', 12: 'BAZ', 13: 'BTM', 14: 'BPI - Dar Assaadah',
    15: 'BPI - Darul Ilmi', 16: 'BPI - Darul Kifayah', 17: 'BPI - HQ', 18: 'BPI - IKB',
    19: 'BPI - PMA', 20: 'BPI - SMA-MAIWP', 21: 'BPI - SMISTA'
  };
  const result = departmentMap[departmentId] || '';
  console.log('🔄 Mapped to:', result);
  return result;
}

export const getKPIData = async () => {
  try {
    console.log('🔍 getKPIData called');
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    console.log('🔍 Session check:', session ? 'Session found' : 'No session');
    
    if (!session) {
      console.log('⚠️ No authenticated session found');
      return [];
    }
    
    console.log('🔍 Fetching KPI data for authenticated user...');
    console.log('🔍 User ID:', session.user.id);
    console.log('🔍 User email:', session.user.email);
    console.log('🔍 User role:', session.user.role);
    
    const { data, error } = await supabase
      .from('kpi_data')
      .select('*')
      .order('created_at', { ascending: false });
    
    console.log('🔍 Raw response from Supabase:', { data, error });
    console.log('🔍 Data length:', data?.length || 0);
    
    if (error) {
      console.error('❌ Error fetching KPI data:', error);
      throw error;
    }
    
    // Transform data back to frontend format
    const transformedData = data.map(item => {
      console.log('🔄 Raw item from database:', item);
      
      // Map department_id to department name
      const departmentName = getDepartmentName(item.department_id);
      console.log('🔄 Department ID:', item.department_id, 'Department Name:', departmentName);
      
      const transformed = {
        id: item.id,
        department: departmentName || item.measurement_data?.department || '',
        kategori: item.measurement_data?.kategori || '',
        kategoriUtama: item.measurement_data?.kategoriUtama || '',
        kpi: item.kpi_statement || '',
        target: item.measurement_data?.target || '',
        bilangan: item.measurement_data?.bilangan || { sasaran: '', pencapaian: '' },
        peratus: item.measurement_data?.peratus || { x: '', y: '', labelX: '', labelY: '' },
        peratusMinimum: item.measurement_data?.peratusMinimum || { x: '', y: '', labelX: '', labelY: '' },
        masa: item.measurement_data?.masa || { sasaranTarikh: '', tarikhCapai: '' },
        tahap: item.measurement_data?.tahap || [],
        tahapSelected: item.measurement_data?.tahapSelected || null,
        peruntukan: item.budget_allocation || '',
        perbelanjaan: item.budget_spent || '',
        percentBelanja: item.measurement_data?.percentBelanja || '-',
        created_at: item.created_at,
        updated_at: item.updated_at
      };
      
      console.log('🔄 Transformed item:', transformed);
      return transformed;
    });
    
    console.log('✅ KPI data transformed successfully:', transformedData);
    return transformedData;
  } catch (error) {
    console.error('❌ Error in getKPIData:', error);
    // Return empty array instead of throwing to prevent crashes
    return [];
  }
};

export const createKPIData = async (kpiData) => {
  try {
    console.log('🔄 Creating KPI with data:', kpiData);
    
    // Transform data to match database schema
    const transformedData = {
      department_id: getDepartmentId(kpiData.department), // Map department name to ID
      category_id: kpiData.kategoriUtama === 'KPI' ? 1 : 2, // 1 for KPI, 2 for SKU
      measurement_type_id: getMeasurementTypeId(kpiData.kategori), // Map kategori to measurement type
      kpi_statement: kpiData.kpi || '',
      target: kpiData.target || '',
      measurement_data: {
        department: kpiData.department,
        kategori: kpiData.kategori,
        kategoriUtama: kpiData.kategoriUtama,
        bilangan: kpiData.bilangan,
        peratus: kpiData.peratus,
        peratusMinimum: kpiData.peratusMinimum,
        masa: kpiData.masa,
        tahap: kpiData.tahap,
        tahapSelected: kpiData.tahapSelected,
        peruntukan: kpiData.peruntukan,
        perbelanjaan: kpiData.perbelanjaan,
        percentBelanja: kpiData.percentBelanja
      },
      budget_allocation: parseFloat(kpiData.peruntukan) || 0,
      budget_spent: parseFloat(kpiData.perbelanjaan) || 0
    };
    
    // Helper function to map department name to ID
    function getDepartmentId(departmentName) {
      const departmentMap = {
        'BKP': 1, 'MCP': 2, 'BWP': 3, 'UI': 4, 'UUU': 5, 'BPA': 6, 'MCL': 7, 'UAD': 8,
        'BPPH': 9, 'UKK': 10, 'BPSM': 11, 'BAZ': 12, 'BTM': 13, 'BPI - Dar Assaadah': 14,
        'BPI - Darul Ilmi': 15, 'BPI - Darul Kifayah': 16, 'BPI - HQ': 17, 'BPI - IKB': 18,
        'BPI - PMA': 19, 'BPI - SMA-MAIWP': 20, 'BPI - SMISTA': 21
      };
      return departmentMap[departmentName] || 1; // Default to 1 if not found
    }
    
    // Helper function to map kategori to measurement_type_id
    function getMeasurementTypeId(kategori) {
      switch(kategori) {
        case 'Bilangan': return 1;
        case 'Peratus': return 2;
        case 'Peratus Minimum': return 3;
        case 'Masa': return 4;
        case 'Tahap Kemajuan': return 5;
        default: return 1;
      }
    }
    
    console.log('🔄 Transformed data:', transformedData);
    
    const { data, error } = await supabase
      .from('kpi_data')
      .insert([transformedData])
      .select();
    
    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }
    
    console.log('✅ KPI created successfully:', data[0]);
    
    // Transform the created data back to frontend format
    const createdItem = data[0];
    const departmentName = getDepartmentName(createdItem.department_id);
    
    const transformedCreatedData = {
      id: createdItem.id,
      department: departmentName || createdItem.measurement_data?.department || '',
      kategori: createdItem.measurement_data?.kategori || '',
      kategoriUtama: createdItem.measurement_data?.kategoriUtama || '',
      kpi: createdItem.kpi_statement || '',
      target: createdItem.target || '',
      bilangan: createdItem.measurement_data?.bilangan || {},
      peratus: createdItem.measurement_data?.peratus || {},
      peratusMinimum: createdItem.measurement_data?.peratusMinimum || {},
      masa: createdItem.measurement_data?.masa || {},
      tahap: createdItem.measurement_data?.tahap || [],
      tahapSelected: createdItem.measurement_data?.tahapSelected || null,
      peruntukan: createdItem.measurement_data?.peruntukan || '',
      perbelanjaan: createdItem.measurement_data?.perbelanjaan || '',
      percentBelanja: createdItem.measurement_data?.percentBelanja || '-'
    };
    
    console.log('🔄 Transformed created data:', transformedCreatedData);
    return transformedCreatedData;
  } catch (error) {
    console.error('❌ Error creating KPI data:', error);
    throw error;
  }
};

export const updateKPIData = async (id, updates) => {
  try {
    console.log('🔄 Updating KPI with data:', updates);
    
    // Transform data to match database schema (same as createKPIData)
    const transformedData = {
      department_id: getDepartmentId(updates.department), // Map department name to ID
      category_id: updates.kategoriUtama === 'KPI' ? 1 : 2, // 1 for KPI, 2 for SKU
      measurement_type_id: getMeasurementTypeId(updates.kategori), // Map kategori to measurement type
      kpi_statement: updates.kpi || '',
      target: updates.target || '',
      measurement_data: {
        department: updates.department,
        kategori: updates.kategori,
        kategoriUtama: updates.kategoriUtama,
        bilangan: updates.bilangan,
        peratus: updates.peratus,
        peratusMinimum: updates.peratusMinimum,
        masa: updates.masa,
        tahap: updates.tahap,
        tahapSelected: updates.tahapSelected,
        peruntukan: updates.peruntukan,
        perbelanjaan: updates.perbelanjaan,
        percentBelanja: updates.percentBelanja
      },
      budget_allocation: parseFloat(updates.peruntukan) || 0,
      budget_spent: parseFloat(updates.perbelanjaan) || 0
    };
    
    // Helper function to map department name to ID
    function getDepartmentId(departmentName) {
      const departmentMap = {
        'BKP': 1, 'MCP': 2, 'BWP': 3, 'UI': 4, 'UUU': 5, 'BPA': 6, 'MCL': 7, 'UAD': 8,
        'BPPH': 9, 'UKK': 10, 'BPSM': 11, 'BAZ': 12, 'BTM': 13, 'BPI - Dar Assaadah': 14,
        'BPI - Darul Ilmi': 15, 'BPI - Darul Kifayah': 16, 'BPI - HQ': 17, 'BPI - IKB': 18,
        'BPI - PMA': 19, 'BPI - SMA-MAIWP': 20, 'BPI - SMISTA': 21
      };
      return departmentMap[departmentName] || 1; // Default to 1 if not found
    }
    
    // Helper function to map kategori to measurement_type_id
    function getMeasurementTypeId(kategori) {
      switch(kategori) {
        case 'Bilangan': return 1;
        case 'Peratus': return 2;
        case 'Peratus Minimum': return 3;
        case 'Masa': return 4;
        case 'Tahap Kemajuan': return 5;
        default: return 1;
      }
    }
    
    console.log('🔄 Transformed update data:', transformedData);
    
    const { data, error } = await supabase
      .from('kpi_data')
      .update(transformedData)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }
    
    console.log('✅ KPI updated successfully:', data[0]);
    
    // Transform the updated data back to frontend format
    const updatedItem = data[0];
    const departmentName = getDepartmentName(updatedItem.department_id);
    
    const transformedUpdatedData = {
      id: updatedItem.id,
      department: departmentName || updatedItem.measurement_data?.department || '',
      kategori: updatedItem.measurement_data?.kategori || '',
      kategoriUtama: updatedItem.measurement_data?.kategoriUtama || '',
      kpi: updatedItem.kpi_statement || '',
      target: updatedItem.target || '',
      bilangan: updatedItem.measurement_data?.bilangan || {},
      peratus: updatedItem.measurement_data?.peratus || {},
      peratusMinimum: updatedItem.measurement_data?.peratusMinimum || {},
      masa: updatedItem.measurement_data?.masa || {},
      tahap: updatedItem.measurement_data?.tahap || [],
      tahapSelected: updatedItem.measurement_data?.tahapSelected || null,
      peruntukan: updatedItem.measurement_data?.peruntukan || '',
      perbelanjaan: updatedItem.measurement_data?.perbelanjaan || '',
      percentBelanja: updatedItem.measurement_data?.percentBelanja || '-'
    };
    
    console.log('🔄 Transformed updated data:', transformedUpdatedData);
    return transformedUpdatedData;
  } catch (error) {
    console.error('❌ Error updating KPI data:', error);
    throw error;
  }
};

export const deleteKPIData = async (id) => {
  try {
    const { error } = await supabase
      .from('kpi_data')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting KPI data:', error);
    throw error;
  }
};

// =====================================================
// KPI PROGRESS LEVELS SERVICE
// =====================================================

export const getKPIProgressLevels = async (kpiId) => {
  try {
    const { data, error } = await supabase
      .from('kpi_progress_levels')
      .select('*')
      .eq('kpi_id', kpiId)
      .order('level_order');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching KPI progress levels:', error);
    throw error;
  }
};

export const createKPIProgressLevel = async (progressLevel) => {
  try {
    const { data, error } = await supabase
      .from('kpi_progress_levels')
      .insert([progressLevel])
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error creating KPI progress level:', error);
    throw error;
  }
};

// =====================================================
// KPI UPDATES HISTORY SERVICE
// =====================================================

export const getKPIUpdatesHistory = async (kpiId) => {
  try {
    const { data, error } = await supabase
      .from('kpi_updates_history')
      .select('*')
      .eq('kpi_id', kpiId)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching KPI updates history:', error);
    throw error;
  }
}; 