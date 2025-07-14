
import { supabase } from '../../supabase.ts';
import { SdgAlignmentReport } from '../../types.ts';
import { mapObjectToSnakeCase, mapObjectToCamelCase, handleResponse } from './utils';

const sanitizeSdgReport = (report: any): SdgAlignmentReport => {
    // This function now robustly handles two states:
    // 1. Raw data from DB with snake_case keys.
    // 2. Data from the app state that might be partially camelCased but has a stringified `detailedAnalysis`.
    
    // First, make a mutable copy.
    const sanitizedReport = { ...report };

    // Identify the key for detailed analysis, whether it's snake_case or already camelCased.
    const analysisKey = sanitizedReport.hasOwnProperty('detailed_analysis') ? 'detailed_analysis' : 'detailedAnalysis';

    // If the analysis field exists and is a string, parse it.
    if (sanitizedReport[analysisKey] && typeof sanitizedReport[analysisKey] === 'string') {
        try {
            const parsed = JSON.parse(sanitizedReport[analysisKey]);
            sanitizedReport[analysisKey] = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.error("Failed to parse corrupted 'detailedAnalysis' string for report:", sanitizedReport.id, e);
            sanitizedReport[analysisKey] = [];
        }
    }
    
    // Now, with `detailed_analysis` guaranteed to be an array (or non-existent),
    // convert the ENTIRE object to camelCase. This will recursively handle the keys
    // within the `detailedAnalysis` array as well.
    const camelCasedReport = mapObjectToCamelCase(sanitizedReport) as SdgAlignmentReport;

    // Final check to ensure detailedAnalysis is an array, handling cases where it was null or invalid.
    if (!Array.isArray(camelCasedReport.detailedAnalysis)) {
        camelCasedReport.detailedAnalysis = [];
    }

    return camelCasedReport;
}

export const getSdgAlignmentReports = async (): Promise<SdgAlignmentReport[]> => {
    const { data: rawReports, error } = await supabase.from('sdg_alignment_reports').select('*');
    handleResponse({ data: rawReports, error });
    if (!rawReports) return [];
    return rawReports.map(sanitizeSdgReport);
};

export const addSdgAlignmentReport = async (report: Omit<SdgAlignmentReport, 'id' | 'createdAt'>): Promise<SdgAlignmentReport> => {
    const { data, error } = await supabase
        .from('sdg_alignment_reports')
        .insert(mapObjectToSnakeCase(report))
        .select()
        .single();
    
    const newRawReport = handleResponse({ data, error });
    return sanitizeSdgReport(newRawReport);
};

export const deleteSdgAlignmentReport = async (id: string): Promise<void> => {
    return handleResponse(await supabase.from('sdg_alignment_reports').delete().eq('id', id));
};
