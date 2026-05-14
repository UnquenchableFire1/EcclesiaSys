import * as XLSX from 'xlsx';

// Export members data to Excel file (.xlsx format)
/**
 * @param {Array} members List of members
 * @param {Array} branches Optional list of branches for name mapping
 * @returns {boolean} Success status
 */
export function downloadMembersAsExcel(members, branches = []) {
    if (!members || members.length === 0) {
        console.warn('No members to export');
        return false;
    }

    try {
        // Prepare data for Excel
        const headers = [
            'ID', 'Title', 'First Name', 'Last Name', 'Email', 'Phone', 'Gender', 
            'Branch', 'Status', 'Joined Date', 'Membership Type', 
            'Date of Birth', 'Place of Birth', 'Marital Status', 
            'Nationality', 'Country of Birth', 'Hometown', 
            'Residential Address', 'GPS Address', 'Street Name', 'City', 
            'Postal Code', 'Locality', 'Landmark', 
            'Family Contact Name', 'Relationship', 'Parent/Guardian Name', 'Parent/Guardian Contact',
            'Holy Ghost Baptism', 'Holy Spirit Baptism Date', 'Water Baptism', 'Water Baptism Date',
            'Place of Baptism', 'Officiating Minister (Baptism)', 'Minister District',
            'Date of Conversion', 'Former Church', 'Communicant', 
            'Position in Church', 'Ministry', 'Zone', 'Occupation', 'HUM Status',
            'Education Level', 'School Name', 'School/Work Locality',
            'Is Entrepreneur', 'Is Retired', 'Date of Retirement',
            'Has Disability', 'Nature of Disability', 'Assistive Device',
            'Royal Status', 'Traditional Area', 'Year Appointed',
            'Is Dedicated', 'Dedication Date', 'Officiating Minister (Dedication)', 'Dedication Church',
            'Bio', 'Other Appointments'
        ];
        
        // Map branch ID to name for sorting/display
        const getBranchName = (id) => branches.find(b => b.id === id)?.name || 'Central / No Branch';
        
        // Sort by branch name then by name
        const sortedMembers = [...members].sort((a, b) => {
            const bA = getBranchName(a.branchId);
            const bB = getBranchName(b.branchId);
            if (bA !== bB) return bA.localeCompare(bB);
            return (a.firstName || '').localeCompare(b.firstName || '');
        });

        const rows = sortedMembers.map(m => [
            m.id || '',
            m.title || '',
            m.firstName || '',
            m.lastName || '',
            m.email || '',
            m.phoneNumber || '',
            m.gender || '',
            getBranchName(m.branchId),
            m.status || '',
            m.joinedDate ? new Date(m.joinedDate).toLocaleDateString() : '',
            m.membershipType || '',
            m.dateOfBirth || '',
            m.placeOfBirth || '',
            m.maritalStatus || '',
            m.nationality || '',
            m.countryOfBirth || '',
            m.hometown || '',
            m.residentialAddress || '',
            m.gpsAddress || '',
            m.streetName || '',
            m.city || '',
            m.postalCode || '',
            m.locality || '',
            m.landmark || '',
            m.familyMemberName || '',
            m.relationship || '',
            m.parentGuardianName || '',
            m.parentGuardianContact || '',
            m.holyGhostBaptism || '',
            m.dateOfHolySpiritBaptism || '',
            m.waterBaptism || '',
            m.dateOfWaterBaptism || '',
            m.placeOfBaptism || '',
            m.officiatingMinisterAtBaptism || '',
            m.officiatingMinisterDistrict || '',
            m.dateOfConversion || '',
            m.formerChurch || '',
            m.communicant || '',
            m.positionInChurch || '',
            m.ministry || '',
            m.zone || '',
            m.occupation || '',
            m.humStatus || '',
            m.levelOfEducation || '',
            m.schoolName || '',
            m.schoolLocation || '',
            m.isEntrepreneur || '',
            m.isRetired || '',
            m.dateOfRetirement || '',
            m.hasDisability || '',
            m.natureOfDisability || '',
            m.assistiveDevice || '',
            m.royalStatus || '',
            m.traditionalArea || '',
            m.yearAppointed || '',
            m.isDedicated || '',
            m.dedicationDate || '',
            m.officiatingMinisterAtDedication || '',
            m.dedicationChurch || '',
            m.bio || '',
            m.otherAppointments || ''
        ]);

        // Create worksheet with headers and data
        const worksheetData = [headers, ...rows];
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

        // Create workbook and add worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Members');

        // Generate Excel file and download
        const fileName = `members_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, fileName);
        return true;
    } catch (error) {
        console.error('Export failed:', error);
        return false;
    }
}

// Export to true Excel format (XLSX) - same as downloadMembersAsExcel
export function downloadMembersAsXLSX(members, branches) {
    return downloadMembersAsExcel(members, branches);
}
