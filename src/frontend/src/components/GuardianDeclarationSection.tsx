import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { AdmissionForm } from "../types";

interface GuardianDeclarationSectionProps {
  formData: Partial<AdmissionForm>;
  setFormData: (data: Partial<AdmissionForm>) => void;
  disabled?: boolean;
}

export default function GuardianDeclarationSection({
  formData,
  setFormData,
  disabled,
}: GuardianDeclarationSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Declaration / घोषणा</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* English Declaration */}
        <div className="p-4 bg-muted rounded-lg text-sm space-y-2">
          <p className="font-semibold text-foreground mb-2">English:</p>
          <p className="leading-relaxed text-muted-foreground">
            All information provided in this form by my son/daughter is true. My
            son/daughter shall abide by all orders, instructions, and rules
            issued by the school administration. My son/daughter shall not claim
            any government benefits if his/her attendance falls below 75% or if
            he/she fails to attend school in the prescribed uniform. If my
            son/daughter attends school without wearing the prescribed uniform,
            I shall personally visit the school and assist with office-related
            tasks.
          </p>
          <p className="leading-relaxed text-muted-foreground mt-2">
            <strong>Note</strong> – As per the departmental letter bearing "Memo
            No. – 9 / Poshak Yo. – 02/2024 (Part) – 44, Patna, dated
            20/01/2025," students are strictly prohibited from wearing any
            attire other than the prescribed school uniform; specifically, no
            decorative or ostentatious clothing is permitted.
          </p>
          <p className="leading-relaxed text-muted-foreground">
            <strong>Boys' Uniform:</strong> Shirt Color – Sky Blue; Trousers
            Color – Navy Blue.
            <br />
            <strong>Girls' Uniform:</strong> Kameez Color – Sky Blue;
            Salwar/Dupatta Color – Navy Blue.
          </p>
        </div>

        {/* Hindi Declaration */}
        <div className="p-4 bg-muted rounded-lg text-sm space-y-2">
          <p className="font-semibold text-foreground mb-2">हिंदी:</p>
          <p className="leading-relaxed text-muted-foreground" lang="hi">
            इस फ़ॉर्म में मेरे बेटे/बेटी द्वारा दी गई सभी जानकारी सच है। मेरा बेटा/बेटी स्कूल
            प्रशासन द्वारा जारी किए गए सभी आदेशों, निर्देशों और नियमों का पालन
            करेगा/करेगी। यदि मेरे बेटे/बेटी की उपस्थिति (attendance) 75% से कम हो जाती है,
            या यदि वह निर्धारित यूनिफ़ॉर्म पहनकर स्कूल नहीं आता/आती है, तो वह किसी भी
            सरकारी लाभ का दावा नहीं करेगा/करेगी। यदि मेरा बेटा/बेटी निर्धारित यूनिफ़ॉर्म
            पहने बिना स्कूल आता/आती है, तो मैं स्वयं स्कूल आकर कार्यालय कार्य साथ में
            करूँगा/करुँगी।
          </p>
          <p className="leading-relaxed text-muted-foreground mt-2" lang="hi">
            <strong>नोट</strong> – विभागीय पत्र &quot;ज्ञापांक – 9 / पोशाक यो. –
            02/2024 (भाग) – 44, पटना, दिनांक 20/01/2025&quot; के अनुसार, छात्रों को
            निर्धारित स्कूल यूनिफ़ॉर्म के अलावा कोई भी अन्य पोशाक पहनने की सख्त मनाही है;
            विशेष रूप से, किसी भी प्रकार के सजावटी या भड़कीले कपड़े पहनने की अनुमति नहीं है।
          </p>
          <p className="leading-relaxed text-muted-foreground" lang="hi">
            <strong>लड़कों की यूनिफ़ॉर्म (पोशाक):</strong> शर्ट का रंग – आसमानी नीला
            (Sky Blue); पैंट (Trousers) का रंग – गहरा नीला (Navy Blue)।
            <br />
            <strong>लड़कियों की यूनिफ़ॉर्म (पोशाक):</strong> समीज़ का रंग – आसमानी नीला
            (Sky Blue); सलवार/दुपट्टे का रंग – गहरा नीला (Navy Blue)।
          </p>
        </div>

        {/* Acknowledgement Checkbox */}
        <div className="flex items-start space-x-3 pt-2">
          <Checkbox
            id="guardianDeclaration"
            checked={formData.guardianDeclaration || false}
            onCheckedChange={(checked) =>
              setFormData({
                ...formData,
                guardianDeclaration: checked as boolean,
              })
            }
            disabled={disabled}
            className="mt-0.5"
          />
          <Label
            htmlFor="guardianDeclaration"
            className="font-medium cursor-pointer leading-relaxed"
          >
            <span className="block">
              I / We have read and agree to the above declaration *
            </span>
            <span className="block text-muted-foreground mt-0.5" lang="hi">
              मैंने/हमने उपरोक्त घोषणा पढ़ी है और सहमत हैं *
            </span>
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}
