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

// AES-256-GCM + PBKDF2 (100,000 iterations, random salt) encrypted identity payload
const ENCRYPTED_DATA = JSON.stringify({
  salt: "7TF+98kKsU3TUgPdvj83iQ==",
  iv: "V4V351hLS4f9sLVD",
  data: "GOyT6+0jyVh6IRr+piNFqi6y2bfCvkBTPcvDe6kfb1xtu3tG0xCAGWIBL6utF557vPmQI0UXVHb3dsKmGFXfCmKWJ6LDeo1QyuuhCGsIsZ62sVGkUWbW9k8iMIYB3Tw81kvpikXYATH0Fvy2EisEBSC8lLzamey7OctDZaWodydp3+sAOqFqLq7bXm75HCdfgfrHy01ruVIhR1OYSx2FDsRQwdhIs8nNwBKrTLLEMtIVdzSuZgvG9BpSMu8IImRAVnRB4xE8hgO09jZKV3zCIEe5ggXXoMXRlrVKMN4uIvUBKMTWn+0otEAkbC4n2097qIrofj/BAlAgAxUyXeogyM0/hu6T7K89zGP8eoO4Z77VefDaSyU45R2F2sjSguG5MMlwlZMkl9kmKEApYGMEt4STX75OxILzyImtXm0KXLaZYmlPtcWQTDWLle/j6Az71y0RkAdV0lNfuI3FbAwjmZnjGmsvzWVEOg9wMkgn+Ovtk/REgexiaox+5HiQ7LpVBYTKjREOnmeLpE1s/P81XmtfQyUt1h5QSAS9nDIPkdFRAIhZ000tv1NAhzmLEWkU49vVNR8O7zKVYTNyeQDP5ySeVRDhRLZsc1JLvM6MK7tSTcRpcklYXeS8gEOUArIAC6SEyoQuls0k70/yDkZ15MaUDbTMqoFKB0IdPyHCxl8LFzMRTjeI5SWPdKA0Z6O3POmwSW1BKV7lVZkbuSayNPkTeratJWOZO/WehWez/948BWr+jjWIc6X0L0ILByTOIQNopBBWJVtaZqnw4mh3beQgjPVIsxhD4I9IeRAD6ELbl27Nsd9YVLTfjFH2EKrxpmuSaNmBZ9QPUH3iD96lNXK8y5xbud0KQAFgH+ztZon5MCL88p1R36PMLbT/bp9Wf9gbdXtSn1+XcSoTNoYshUFd9RZewk1gDG7VRVnfQFfjd/fwsJbcN7d+ReG0yy7v1SU9ur9f+sYjmvRAYR+5Q1YNhhTDnA1NrUcOrXzYbs67+2a37wmm2nrNiUNDo+THwYnGdV4U82a2XyAr7/Y+HGjE5RWXUpFLWKUGndRsJs7vBeY7T/qn7LGabtSiJ38Ed0xa9fO9PlYuFhaJsPWrGkp3hi+dWLQUiP3JqfQFysFY6mOVBFII3/Dk9mS3uT7HxfibwEBsXWcFrVny4noW0HV1s32B9UopuzKIQeetC/eYttoU4FXfJxi9bFv+TOPz1ltLfXePJEdJ9Nv9ZZgDJOB0ZOW8f+HXW62Dq7uSjtjJ08VdLMlM3OGlWv6LbcZl/+C+Ks7Og5+52e9JV+k9pQ/Cs4HsZiRusc/aIWuDBcAacuPbkZdKp8itHf0drSNKBcXuE2X6E1DCdtcAmjC6r4MLNLRBEHKNeYM/R3A1GUdHxBtdXU1TCTJQ3ey65qOC8HDu4Z/LRlI262MrhlnJJg=="
});

const Info = () => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [data, setData] = useState<DecryptedData | null>(null);

  const handleUnlock = async (e: FormEvent) => {
    e.preventDefault();
    if (!password) return;

    const decryptedString = await decryptWithPassword(ENCRYPTED_DATA, password);
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
