
import React, { useState, useEffect } from 'react';
import { produce } from 'immer';
import { useAppContext } from '../../context/AppContext.tsx';
import { ProgramGuideline } from '../../types.ts';
import * as api from '../../services/api.ts';
import FormField from '../ui/FormField.tsx';
import { Textarea } from '../ui/Textarea.tsx';
import { NOHFC_GUIDELINES } from '../../constants/nohfc.guidelines.ts';

const GUIDELINE_DOC_NAME = "NOHFC Community Enhancement";

const NohfcProgramGuidelinesEditor: React.FC = () => {
    const { state, dispatch, notify } = useAppContext();
    const [guidelineDoc, setGuidelineDoc] = useState<ProgramGuideline | null>(null);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        const doc = state.programGuidelines.find(g => g.name === GUIDELINE_DOC_NAME);
        if (doc) {
            const formattedDoc = { ...doc, guidelineData: JSON.stringify(doc.guidelineData, null, 2) };
            setGuidelineDoc(formattedDoc as any);
        } else {
            setGuidelineDoc(null);
        }
        setIsDirty(false);
    }, [state.programGuidelines]);

    const handleCreateDefault = async () => {
        const newGuideline: Omit<ProgramGuideline, 'id'|'createdAt'> = {
            name: GUIDELINE_DOC_NAME,
            description: "Guidelines for the NOHFC Community Enhancement Program.",
            guidelineData: NOHFC_GUIDELINES
        };
        try {
            const addedDoc = await api.addProgramGuideline(newGuideline);
            dispatch({ type: 'ADD_PROGRAM_GUIDELINE', payload: addedDoc });
            notify('Default NOHFC guidelines created successfully.', 'success');
        } catch (error: any) {
            notify(`Error creating guidelines: ${error.message}`, 'error');
        }
    };

    const handleSave = async () => {
        if (!guidelineDoc) return;
        try {
            const dataToSave = {
                ...guidelineDoc,
                guidelineData: JSON.parse((guidelineDoc as any).guidelineData)
            };
            const updatedDoc = await api.updateProgramGuideline(guidelineDoc.id, dataToSave);
            dispatch({ type: 'UPDATE_PROGRAM_GUIDELINE', payload: updatedDoc });
            setIsDirty(false);
            notify('Guidelines saved.', 'success');
        } catch (error: any) {
            notify(`Error parsing or saving JSON: ${error.message}`, 'error');
        }
    };

    if (!guidelineDoc) {
        return (
            <div className="text-center py-10 bg-slate-100 rounded-lg">
                <h3 className="text-lg font-semibold text-slate-700">No Guidelines Found</h3>
                <p className="text-slate-500 my-2">The NOHFC guidelines have not been set up yet.</p>
                <button
                    onClick={handleCreateDefault}
                    className="btn btn-primary"
                >
                    Create Default Guidelines
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <FormField
                label="NOHFC Guidelines (JSON)"
                htmlFor="guideline_data"
                instructions="Edit the structured guidelines below. This data is used by the AI to ensure compliance. You must use valid JSON format."
            >
                <Textarea
                    id="guideline_data"
                    value={(guidelineDoc as any).guidelineData}
                    onChange={(e) => {
                        setGuidelineDoc(produce(draft => { if(draft) (draft as any).guidelineData = e.target.value }));
                        setIsDirty(true);
                    }}
                    rows={25}
                    className="font-mono text-xs"
                />
            </FormField>
            <div className="text-right">
                <button
                    onClick={handleSave}
                    disabled={!isDirty}
                    className="btn btn-primary"
                >
                    Save Guidelines
                </button>
            </div>
        </div>
    );
};

export default NohfcProgramGuidelinesEditor;
