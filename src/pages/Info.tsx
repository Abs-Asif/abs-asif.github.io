import { useState, FormEvent } from "react";
import { decryptWithPassword } from "@/lib/encryption";
import { Lock, KeyRound, AlertCircle } from "lucide-react";

interface InfoItem {
  label: string;
  labelBn: string;
  value: string;
  valueBn: string;
  selectable?: boolean;
}

interface AddressData {
  en: string[];
  bn: string[];
}

interface DecryptedData {
  infoData: InfoItem[];
  address: AddressData;
}

// Encrypted identity payload (5-level multi-layered cipher)
const ENCRYPTED_DATA = "BAd-IREbMB8SGgMcJgoaAQY0NwkYIyh_EBEFPhAMGXpobVQTAzURcRIBA3cRDw4sHz8TDQMKFjsUGxUvIRh-EwMKY0tqbSgEAmUmcDAAIAUrAy0ZAREkCw5gJTIfGikVCwx8bAxud35dOyI4GQMZORYTPDMTAiIHBBIyJzQFFyYCBHUIEQATHV0IdgsDBxk_JHMNPxUxLQcXCwIFBww3PCIMChoSKSchCDINU2pTfjsFCR4NFBAtCwgOFgcYAAcdOBphEwMIKwIXGnovDzV3Y3ZsBj0cOT0VGSgSNBwcIQUaJBotDRQQIRkiC3ENJy01BWxjSmFhCBgCEycMECovHwkuIjoeETpvMQcPCC4HLAkRETEwam9uCzEHOw0ccDwUD20HchcgGgYBDgUUI2kkJCV2NxwUATdqdG92ODB9OAcQOiY-BSUODx8CAx4NCx4RCwsrBRYxARc4NFJAbG0eES0CExAAEnQnBBMTAgYiPDMSPiksFiZ4CxJ6Dw46fHd8bWMDNgcuFWQIdRY-ChJ_HhoRNWoDcS0KHhQgMSh3bDR0flwOBz96BwhzMAAVNB8uICIODg4eLycTHDg7I3c3ISEjCQpjbXYeMCMOExUMLQI6HAIAHD4fIjwZO3I4CgkJJxgjNgMHUX51CRYbFWY9AQYpKyUQPh80BiIaFw0FFzMWFyUSBnsqIQ1SWg1pCCIHBXUvABITCQslACkjHD89Gh8UKQoeKxYMHXcPHGhvUFIBP3YCERQkBx5vDw0RJBYPMTJqCRhrdSQgLxkYCB5ue2hgXBUAIiQ3Fj8PEBEPDi4rACUNACUeAhR-HQcWCHofOBd7bGlWIGIuAi0rGhACNB91NRwNewIzBWAIKxoZBwY8HD1tDVRJa3VgIjkZAycNFyknHhMuCyweEwMbBCsTIRxxEmoZDTEFWAhQTwIEJwwWFAYDERsDNhIIJH82aBkBJAwaehJ0CRkkHCdYY31-EgMkJA0ZAi10PSQdMhg5MR47GwITCBQVKhMYAREWCVFuXVMgZB4BLjQBEDwtKnY1ARkdFjcNFi4uLQgTMDwPCzgOCUl-YQciADYTGQYQKjcCEgIqYRMBKTECBzEAHSsKNRENPQ1obFxSBxcjFhMWEgsXMgcWFyNlMxlrDRYOHjQlIxFqJR8NFU5vU35jBhoGARYABzEJIn0HLBIlYDobFiANfH4uFQcvHwwKVQpafho_KzgpEA0uLAgTdQh7ASMaGj4IAwAbGQ8DBXsxIQ5vf311OxgGBhENGxYDBX8TKQQWKAFoDAFzAzoZBH0qHhMXFFtXUAsFPAEHEgUaCxA0ISwUfDcwAmkrKhQMeQEjdBEdJGsNfWBUSBMAGA4vJ2UtDg4cEnYfPzpkPBoGNAsUPw4SCR0MDyVrfmluNBAsLgMpDigjJR4AHxQFeWQhEgYbHQd-Bx0IIRNpEglre24IIgowKS8lFBwzGxEQHD0qZBMQBgcQNhovLBQZEwxvbFRMUwZieiAXLjAHHm8PLhMjYQoOah0-GA0NfhQva3kcazd7XW1UPgEjPB8nZAswCSIOLiw_Ji4DNRICDgo_dxI0ES0LF3t7am4VJS4DC3AAKzQNHhwHOw4nEmo-FSUsAhoHCxEDF2wKfgBuahU6NgISdj4WEysQHhIYFys5CykEKxMmGBcSHRp0CxVYCFBOBAQnOBMvDjYWCCEKJAsNMAY0ahYiHAYMECoVASQyJ2prVQ04MBcWKhkSExMMDhZwLxEtBTgzFnIND3YKExodAzwZUVhscAIRGxApcDYQdS4odyEKBg8SLAw6GzMdfRsVPA4hDRFua2BtBwQIBnQnGCEMNwIQEjoAEwATNDUXKT0YKwI3BnU1Gm5hVGI1BQJhIXA4KAoJAwYRfRIoNjU7IhM0fRUNdTAzEzIrUnQKbhg2ChoJIT90MAolEh8DZTknCDQGBAsUAXUXMSMkA25JWG5gOBcdEC0yAQYwawR2HHwxDA4xO2ExKh1_JQ8NHgMSCVRdcHRgGAYHDRosECkRfRIrKhIfEAswBAU1FioENAgRdRcYan9uVwlifjUQFA0yJxkTLxMlHgsOHg0DJDIoORIRGSALah1qbn9TZTAkEjwhHCECOhwoBxdlBGQ8GgoZDxsrBwpuDjIDNVEJblQGZx05IRcOEx0nHhEPJQV5AhISFSkyGjUTNwgDKTI9UklVaQc6CAMrDToXEBE7ES4IIChnPRAeLz41GSwsKAZ3AzFaf1xiAWEdIRFzHgceb3wAFiUOABkcFRkWNHV_EHQVHggfGVNdfX4-ASQRMhI_AxwRDA4TAD8TDQ4bEgI7Gj93EDJ6HAhvY39sUxYcKjkfBA51DjQoDC0XAnoCMgoFFwgaGC0ODnkhNw1VY3JcYGsfAxENFxISBQ8eLgQWHhIAJTEGaCEZFxIxGBATbHQJcggxFBU-JgQGMBYyBx4kC2V8N2kZHxcfGiAQLhkIFDIrTWpUYjwFBzwrFToPEz0PHh0AARMTOjMGNAsNcnw";

const Info = () => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [data, setData] = useState<DecryptedData | null>(null);

  const handleUnlock = (e: FormEvent) => {
    e.preventDefault();
    if (!password) return;

    const decryptedString = decryptWithPassword(ENCRYPTED_DATA, password);
    if (decryptedString) {
      try {
        const parsed = JSON.parse(decryptedString);
        setData(parsed);
        setError(false);
      } catch (err) {
        setError(true);
      }
    } else {
      setError(true);
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-800/90 border border-slate-700/80 rounded-2xl p-8 shadow-2xl backdrop-blur-sm text-slate-100">
          <div className="flex flex-col items-center text-center space-y-4 mb-6">
            <div className="p-4 bg-slate-700/50 rounded-full border border-slate-600/50 text-indigo-400">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">Protected Identification Record</h1>
            <p className="text-xs text-slate-400 font-sans">
              Enter authorization key to view content
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <KeyRound className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(false);
                  }}
                  placeholder="Enter Password"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  autoFocus
                />
              </div>
              {error && (
                <div className="flex items-center space-x-2 text-rose-400 text-xs mt-2 pl-1 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Access denied. Invalid password.</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 font-semibold rounded-xl text-white shadow-lg shadow-indigo-600/30 transition-all duration-150"
            >
              Authenticate
            </button>
          </form>
        </div>
      </div>
    );
  }

  const { infoData, address } = data;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 flex justify-center items-start font-sans">
      <div className="w-full max-w-3xl bg-white shadow-xl rounded-xl overflow-hidden border border-slate-200">
        <div className="bg-slate-800 text-white py-6 px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Identity Information / পরিচয় তথ্য</h1>
          <button
            onClick={() => {
              setData(null);
              setPassword("");
            }}
            className="text-xs text-slate-400 hover:text-white underline transition"
          >
            Lock Record
          </button>
        </div>

        <div className="p-0">
          <table className="w-full border-collapse">
            <tbody>
              {infoData.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 bg-slate-50/50 w-1/3 align-top">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{item.label}</div>
                    <div className="text-sm font-bangla text-slate-400 mt-1">{item.labelBn}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className={`text-base font-semibold text-slate-800 ${item.selectable ? 'select-text' : ''}`}>{item.value}</div>
                    <div className={`text-base font-bangla text-slate-600 mt-1 ${item.selectable ? 'select-text' : ''}`}>{item.valueBn}</div>
                  </td>
                </tr>
              ))}
              <tr>
                <td className="py-4 px-6 bg-slate-50/50 w-1/3 align-top">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Permanent Address</div>
                  <div className="text-sm font-bangla text-slate-400 mt-1">স্থায়ী ঠিকানা</div>
                </td>
                <td className="py-4 px-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      {address.en.map((line, i) => (
                        <p key={i} className="text-sm text-slate-700">{line}</p>
                      ))}
                    </div>
                    <div className="space-y-1 font-bangla border-l md:pl-6 border-slate-100">
                      {address.bn.map((line, i) => (
                        <p key={i} className="text-sm text-slate-600">{line}</p>
                      ))}
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-slate-50 py-4 px-8 border-t border-slate-100">
          <p className="text-[10px] text-slate-400 text-center uppercase tracking-[0.2em]">Official Identification Record</p>
        </div>
      </div>
    </div>
  );
};

export default Info;
