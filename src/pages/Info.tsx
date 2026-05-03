import { useState, useEffect } from "react";
import { decrypt } from "@/lib/encryption";

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

const ENCRYPTED_DATA = "EkYMABIGMBhZCExcNFZRCQIXFwkPUUc3TF9VEBlLCAQMEQU2Fw9TTIbJhZPD3ZXUyw9HRw9MXkVXF1NGKApaSTUbSRwCCg5FUycCBxtHAUkTGEFHVXBbS15HjtLHlN6micjlT83V44PT3oWK5oXfi9KXs9XP1oXJ+YnSy83P0IbJlFOFxdmSw5OLw8nNlbAQSEUfRwIVCxEVD1NMIA5ZGwARUgFFQwoIHA8eEl5UCwEJLBpLTlvNz8SGyZKTw8eV1NvNzdVZzZSY0pPXhMPAVkVWD0wFGwNNF1EoAh0UEFceF1l/U1hfVAdGSUwCCBgMSCsARFUPk8PNldTbzc3cmYuZ0JW0icL5jtPolN+dSY7A383V3IPT3IWL1YXfhRBNHk5LCAQMEQVWQw8kARIHSAFCEFUcBEAOR1UPXlFQUAUmC0xOS5Tfg4nI2I+L14XFy5LDnUuF34XSlozVz8pHQlYfFRVYDExcTWwVFxYPE0VvDgIMQBAcEEMICBALNgdWQw+JyOCPi9iFxcWSwqaLw+XNlI4S1c/IhcnzidLuzc/ARBIBCEcPFBAAQUlfW2lTRFcVBgJFDB0bABEPRUwKDk8WCSEbUF8Pi8PlzZSY0pLkhMPAVInS3c3P0IbJnZPD3JXU8w9HRw9MXkVXF1NGV1ZUKAEeWBoaRl0dQ1BBWVATTAcQHG9cEggXicPNjtPHVJmL747A+M3V3YPS/4WL9EWZiprQlZOJw8OO08JWBAESTAoOTxYJQU9QJ0QZERENYFVVXBoQFw8AABsXDQcbCw1IAUdPVx4ETw4JO0MQChDVz/iFyNyJ0/TNz8BGj4vbhcXKksOBi8PRzZW90pPOhMPGVInS0c3PwIbIoJPDz5XU1Q9HRw9MXkVXF1NGV15EXEBAHF5ZXlscQFBaR0FHAUkTGEFHVXBbS15HjtPBlN6LicnAj4rYhcTfksKCi8LezZWd0pLEhMLAlM7emYrOjsHGzdTOg9LdhYrDhd6EEBwQRgwIAA0ACBYVSEtUEh1YFhhPDlAJTAkAFQ8IEnx8LUQLGxkLEQsPRUwKDk8WCSEbUF8Pi8P2zZSY0pPvhMPplM/VmYvWTobJhZPDzZXV6M3NyZmLghIeFx8FCRsRS05bHFlaX1YeSlZSQFBJDx0EFVhXclwXU0aFydOJ09/NzsSGyIKTwsyV1czNzMqZipvQlZKJw85MWEsHHEEMDRIOTx8AQU8GF1gOGCQBEFFWURsBFh1WUw9bSAdMXDQPJQwPGRMCSFFFKUxcRFpUGQUXD1hLWFt9Bh0SVQ01ChEeFxdFChFZABIFBAVYRklMIwgGHRdJVkpPYh4EEVU/BEcCAVUPHhJnRQgeDAIVU1QrTAMPFAdMB0lBWVAhRBgRC0RRRAgVIhEXBxMbFRQBS0JEK0QFDBAcHQsXSzcYQ1VAR0dHRjhCVgsaWxcyTIbJupPC7pXU1c3N25mLnAoS1c/OhcjKidLRzc7jhsmIk8PdldTPzc3bmYqu0JSLRUZJTJTP1ZmL147A+s3V/YPTwl8Ni8PSzZSA0pP8hMLplM/EmYvQjsDRzdX6Q1hShYrAhd6B0peU1c7DSUxYS5TfvonJ+Y+LzYXFxZLCoIvD2BcS0JWbRUSFyOeJ0tfNz95Gj4vdhcXpksOSi8PfARAcENXP7YXI3onS5c3O6YbJn5PD3U9ShYvbhd+T0pau1c/ahcjEidLAzc/QhsmyX0dPV5LDsYvC/s2UgtKT115FjtL8lN6sicn6j4vMhcXiksKgi8PJzZSO0pPHSEdCVonS1c3P0YbJgJPD3ZXU8hdLhd+d0paw1c/Ohcn1idLJzczKRDJQDg==";

const Info = () => {
  const [data, setData] = useState<DecryptedData | null>(null);

  useEffect(() => {
    const decryptedString = decrypt(ENCRYPTED_DATA);
    if (decryptedString) {
      try {
        setData(JSON.parse(decryptedString));
      } catch (e) {
        console.error("Failed to parse decrypted data", e);
      }
    }
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400 font-medium">Loading Identity Record...</div>
      </div>
    );
  }

  const { infoData, address } = data;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 flex justify-center items-start font-sans">
      <div className="w-full max-w-3xl bg-white shadow-xl rounded-xl overflow-hidden border border-slate-200">
        <div className="bg-slate-800 text-white py-6 px-8">
          <h1 className="text-2xl font-bold tracking-tight">Identity Information / পরিচয় তথ্য</h1>
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
