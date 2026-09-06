import { WorkflowManager } from '@convex-dev/workflow'

import { components } from '../_generated/api'
import { MODEL_STEP_RETRY } from './state'

const pipelineWorkflowManager = new WorkflowManager(components.workflow, {
  workpoolOptions: {
    // Let model work proceed while bounded source retrieval waits for its slot.
    // Per-policy/global admissions and Firecrawl pacing still gate each call.
    maxParallelism: 8,
    retryActionsByDefault: false,
    defaultRetryBehavior: MODEL_STEP_RETRY,
  },
})

export const extractionWorkflowManager = pipelineWorkflowManager
export const publicationWorkflowManager = pipelineWorkflowManager
export const issueWorkflowManager = pipelineWorkflowManager
