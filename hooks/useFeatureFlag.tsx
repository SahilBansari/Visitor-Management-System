
import React from 'react';

// In a real app, this would use a library like LaunchDarkly or read from process.env
// For this environment, we simulate the values.
const simulatedEnv = {
    REACT_APP_AI_ENABLED: 'true',
    REACT_APP_WAKE_WORD_ENABLED: 'false',
};

const features = {
    ai: simulatedEnv.REACT_APP_AI_ENABLED !== 'false',
    wakeWord: simulatedEnv.REACT_APP_WAKE_WORD_ENABLED === 'true',
};

export const useFeatureFlag = (flag: keyof typeof features): boolean => {
    return features[flag];
};
