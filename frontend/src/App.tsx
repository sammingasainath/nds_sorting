import { LLMProviderContext } from '@/contexts/LLMContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Router } from './router';

function App() {
    return (
        <LLMProviderContext>
            <ThemeProvider>
                <Router />
            </ThemeProvider>
        </LLMProviderContext>
    );
}

export default App;
