import * as XLSX from 'xlsx';

// Export members data to Excel file (.xlsx format)
export function downloadMembersAsExcel(members) {
    if (!members || members.length === 0) {
        alert('No members to export');
        return;
    }

    try {
        // Prepare data for Excel
        const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Status', 'Joined Date'];
        const rows = members.map(m => [
            m.id,
            m.firstName,
            m.lastName,
            m.email,
            m.phoneNumber,
            m.status,
            m.joinedDate ? new Date(m.joinedDate).toLocaleDateString() : ''
        ]);

        // Create worksheet with headers and data
        const worksheetData = [headers, ...rows];
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

        // Set column widths for better readability
        worksheet['!cols'] = [
            { wch: 8 },   // ID
            { wch: 15 },  // First Name
            { wch: 15 },  // Last Name
            { wch: 25 },  // Email
            { wch: 15 },  // Phone
            { wch: 12 },  // Status
            { wch: 15 }   // Joined Date
        ];

        // Create workbook and add worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Members');

        // Generate Excel file and download
        const fileName = `members_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    } catch (error) {
        console.error('Export failed:', error);
        alert('Failed to export members');
    }
}

// Export to true Excel format (XLSX) - same as downloadMembersAsExcel
export function downloadMembersAsXLSX(members) {
    downloadMembersAsExcel(members);
}
