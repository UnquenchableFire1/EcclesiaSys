// Export members data to Excel file
export function downloadMembersAsExcel(members) {
    if (!members || members.length === 0) {
        alert('No members to export');
        return;
    }

    // Create CSV content
    const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Actual Email', 'Phone', 'Status', 'Joined Date'];
    const rows = members.map(m => [
        m.id,
        m.firstName,
        m.lastName,
        m.email,
        m.actualEmail,
        m.phoneNumber,
        m.status,
        m.joinedDate ? new Date(m.joinedDate).toLocaleDateString() : ''
    ]);

    // Create CSV content
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
        csv += row.map(cell => `"${cell || ''}"`).join(',') + '\n';
    });

    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `members_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Export to true Excel format (XLSX)
export function downloadMembersAsXLSX(members) {
    if (!members || members.length === 0) {
        alert('No members to export');
        return;
    }

    try {
        // Using a CSV format that Excel can read
        downloadMembersAsExcel(members);
    } catch (error) {
        console.error('Export failed:', error);
        alert('Failed to export members');
    }
}
