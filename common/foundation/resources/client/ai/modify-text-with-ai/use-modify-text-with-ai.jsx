import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
import { onFormQueryError } from '@common/errors/on-form-query-error';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
export let ModifyTextWithAiInstruction = /*#__PURE__*/function (ModifyTextWithAiInstruction) {
  ModifyTextWithAiInstruction["Simplify"] = "simplify";
  ModifyTextWithAiInstruction["Shorten"] = "shorten";
  ModifyTextWithAiInstruction["Lengthen"] = "lengthen";
  ModifyTextWithAiInstruction["FixSpelling"] = "fixSpelling";
  ModifyTextWithAiInstruction["Translate"] = "translate";
  ModifyTextWithAiInstruction["ChangeTone"] = "changeTone";
  return ModifyTextWithAiInstruction;
}({});
export let ModifyTextWithAiTone = /*#__PURE__*/function (ModifyTextWithAiTone) {
  ModifyTextWithAiTone["casual"] = "casual";
  ModifyTextWithAiTone["formal"] = "formal";
  ModifyTextWithAiTone["confident"] = "confident";
  ModifyTextWithAiTone["friendly"] = "friendly";
  ModifyTextWithAiTone["inspirational"] = "inspirational";
  ModifyTextWithAiTone["motivational"] = "motivational";
  ModifyTextWithAiTone["nostalgic"] = "nostalgic";
  ModifyTextWithAiTone["professional"] = "professional";
  ModifyTextWithAiTone["playful"] = "playful";
  ModifyTextWithAiTone["scientific"] = "scientific";
  ModifyTextWithAiTone["witty"] = "witty";
  ModifyTextWithAiTone["straightforward"] = "straightforward";
  return ModifyTextWithAiTone;
}({});
export function useModifyTextWithAi(form) {
  return useMutation({
    mutationKey: ['modifyTextWithAi'],
    mutationFn: payload => modifyText(payload),
    onError: err => form ? onFormQueryError(err, form) : showHttpErrorToast(err)
  });
}
async function modifyText(payload) {
  return apiClient.post('ai/modify-text', payload).then(r => r.data);
}