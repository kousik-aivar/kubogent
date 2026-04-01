import type { KubectlMockResponse } from '../types'

export const kubectlMockResponses: KubectlMockResponse[] = [
  {
    pattern: /^kubectl\s+cluster-info$/,
    response: `{{green}}Kubernetes control plane{{reset}} is running at {{cyan}}https://ABCDEF1234567890.gr7.us-east-1.eks.amazonaws.com{{reset}}
{{green}}CoreDNS{{reset}} is running at {{cyan}}https://ABCDEF1234567890.gr7.us-east-1.eks.amazonaws.com/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy{{reset}}

To further debug and diagnose cluster problems, use 'kubectl cluster-info dump'.`,
  },
  {
    pattern: /^kubectl\s+get\s+nodes/,
    response: `NAME              STATUS     ROLES    AGE   VERSION
ip-10-0-1-42      {{green}}Ready{{reset}}      <none>   14d   v1.29.3-eks-adc7111
ip-10-0-1-87      {{green}}Ready{{reset}}      <none>   14d   v1.29.3-eks-adc7111
ip-10-0-2-15      {{green}}Ready{{reset}}      <none>   7d    v1.29.3-eks-adc7111
ip-10-0-2-63      {{red}}NotReady{{reset}}   <none>   7d    v1.29.3-eks-adc7111
ip-10-0-3-21      {{green}}Ready{{reset}}      <none>   21d   v1.29.3-eks-adc7111
ip-10-0-3-98      {{green}}Ready{{reset}}      <none>   3d    v1.29.3-eks-adc7111
ip-10-0-4-44      {{green}}Ready{{reset}}      <none>   30d   v1.29.3-eks-adc7111`,
  },
  {
    pattern: /^kubectl\s+get\s+pods?\s+--all-namespaces/,
    response: `NAMESPACE      NAME                                        READY   STATUS             RESTARTS   AGE
kube-system    coredns-5d78c9869d-abc12                    1/1     {{green}}Running{{reset}}            0          14d
kube-system    coredns-5d78c9869d-def34                    1/1     {{green}}Running{{reset}}            0          14d
kube-system    aws-node-7h9j2                              2/2     {{green}}Running{{reset}}            0          14d
kube-system    karpenter-5f9b7c-k8m2j                      1/1     {{green}}Running{{reset}}            0          7d
kube-system    ebs-csi-controller-0                        6/6     {{green}}Running{{reset}}            0          14d
ml-serving     llm-inference-7f8d9c-x4k2p                  1/1     {{green}}Running{{reset}}            0          2h
ml-serving     llm-inference-7f8d9c-r9p3v                  1/1     {{green}}Running{{reset}}            1          2h
ml-serving     model-registry-6b5c4d-m3n1q                 1/1     {{green}}Running{{reset}}            0          5d
ml-serving     model-registry-6b5c4d-crash1                0/1     {{red}}CrashLoopBackOff{{reset}}   8          2h
ml-serving     whisper-asr-5c7d9e-h3k4m                    1/1     {{green}}Running{{reset}}            0          1d
ml-serving     model-serving-gateway-8a2b3c-p4q5r          1/1     {{green}}Running{{reset}}            0          3d
monitoring     prometheus-server-0                          2/2     {{green}}Running{{reset}}            0          6h
monitoring     grafana-6f8d9c-t5v2w                        1/1     {{green}}Running{{reset}}            0          6h
monitoring     fluent-bit-8x2n4                            1/1     {{green}}Running{{reset}}            0          14d
default        training-job-mistral-7b-ft-2                 1/1     {{green}}Running{{reset}}            0          4h
default        codellama-build-job-x7n2p                   0/1     {{yellow}}Completed{{reset}}          0          1h`,
  },
  {
    pattern: /^kubectl\s+get\s+pods?\s*(-n\s+\S+)?$/,
    response: `NAME                                        READY   STATUS             RESTARTS   AGE
llm-inference-7f8d9c-x4k2p                  1/1     {{green}}Running{{reset}}            0          2h
llm-inference-7f8d9c-r9p3v                  1/1     {{green}}Running{{reset}}            1          2h
model-registry-6b5c4d-m3n1q                 1/1     {{green}}Running{{reset}}            0          5d
model-registry-6b5c4d-crash1                0/1     {{red}}CrashLoopBackOff{{reset}}   8          2h
whisper-asr-5c7d9e-h3k4m                    1/1     {{green}}Running{{reset}}            0          1d
model-serving-gateway-8a2b3c-p4q5r          1/1     {{green}}Running{{reset}}            0          3d
training-job-mistral-7b-ft-2                1/1     {{green}}Running{{reset}}            0          4h`,
  },
  {
    pattern: /^kubectl\s+get\s+(svc|services)/,
    response: `NAME                      TYPE           CLUSTER-IP       EXTERNAL-IP                              PORT(S)          AGE
kubernetes                ClusterIP      10.100.0.1       <none>                                   443/TCP          30d
llm-inference-svc         LoadBalancer   10.100.45.128    a1b2c3-1234.us-east-1.elb.amazonaws.com  8000:31234/TCP   2h
model-registry-api        ClusterIP      10.100.67.42     <none>                                   8080/TCP         5d
model-serving-gateway     LoadBalancer   10.100.89.15     d4e5f6-5678.us-east-1.elb.amazonaws.com  443:32100/TCP    3d
whisper-asr-svc           ClusterIP      10.100.23.78     <none>                                   8001/TCP         1d
prometheus-server          ClusterIP      10.100.91.33     <none>                                   9090/TCP         6h
grafana                   NodePort       10.100.55.12     <none>                                   3000:30300/TCP   6h`,
  },
  {
    pattern: /^kubectl\s+get\s+deploy(ments)?/,
    response: `NAME                      READY   UP-TO-DATE   AVAILABLE   AGE
llm-inference             4/4     4            4           2h
model-registry            2/2     2            2           5d
model-serving-gateway     3/3     3            3           3d
whisper-asr               1/1     1            1           1d
metrics-collector         2/2     2            2           14d`,
  },
  {
    pattern: /^kubectl\s+describe\s+pod/,
    response: `Name:             llm-inference-7f8d9c-x4k2p
Namespace:        ml-serving
Priority:         0
Service Account:  llm-inference-sa
Node:             ip-10-0-1-42/10.0.1.42
Start Time:       Sun, 23 Mar 2025 12:18:33 +0000
Labels:           app=llm-inference
                  pod-template-hash=7f8d9c
Status:           {{green}}Running{{reset}}
IP:               10.0.1.156
Containers:
  vllm:
    Image:          kubogent/vllm:0.4.2
    Port:           8000/TCP
    State:          {{green}}Running{{reset}}
      Started:      Sun, 23 Mar 2025 12:19:45 +0000
    Ready:          True
    Limits:
      nvidia.com/gpu:  4
      memory:          128Gi
      cpu:             32
    Requests:
      nvidia.com/gpu:  4
      memory:          96Gi
      cpu:             16
    Environment:
      MODEL_NAME:          meta-llama/Llama-3.1-70B-Instruct
      TENSOR_PARALLEL:     4
      MAX_MODEL_LEN:       4096
Conditions:
  Type              Status
  Initialized       True
  Ready             True
  ContainersReady   True
  PodScheduled      True
Events:
  Type    Reason     Age   Message
  ----    ------     ----  -------
  Normal  Scheduled  2h    Successfully assigned ml-serving/llm-inference-7f8d9c-x4k2p to ip-10-0-1-42
  Normal  Pulled     2h    Container image "kubogent/vllm:0.4.2" already present on machine
  Normal  Created    2h    Created container vllm
  Normal  Started    2h    Started container vllm`,
  },
  {
    pattern: /^kubectl\s+logs/,
    response: `2025-03-23T12:19:45Z INFO  Loading model meta-llama/Llama-3.1-70B-Instruct...
2025-03-23T12:20:12Z INFO  Downloading model weights from cache: /models/llama-3.1-70b/
2025-03-23T12:21:33Z INFO  Loading model weights (137B parameters)...
2025-03-23T12:23:18Z INFO  Model loaded in 153.2 seconds
2025-03-23T12:23:19Z INFO  GPU memory allocated: 71.4 GiB across 4 GPUs
2025-03-23T12:23:19Z INFO  Tensor parallel size: 4
2025-03-23T12:23:20Z INFO  Starting vLLM engine with max_model_len=4096
2025-03-23T12:23:21Z INFO  KV cache initialized: 32768 blocks, 8.0 GiB
2025-03-23T12:23:22Z INFO  Server started at http://0.0.0.0:8000
2025-03-23T14:15:01Z INFO  Request processed: tokens=512, latency=142ms, throughput=3605 tok/s
2025-03-23T14:15:03Z INFO  Request processed: tokens=256, latency=89ms, throughput=2876 tok/s
2025-03-23T14:15:05Z {{yellow}}WARN{{reset}}  KV cache utilization at 78.4%, consider scaling replicas
2025-03-23T14:15:08Z INFO  Request processed: tokens=1024, latency=312ms, throughput=3282 tok/s`,
  },
  {
    pattern: /^kubectl\s+top\s+nodes/,
    response: `NAME              CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%
ip-10-0-1-42      28800m       72%    218Gi           68%
ip-10-0-1-87      22400m       56%    237Gi           74%
ip-10-0-2-15      9960m        83%    65Gi            82%
ip-10-0-2-63      11400m       95%    75Gi            94%
ip-10-0-3-21      7872m        41%    42Gi            55%
ip-10-0-3-98      29760m       62%    195Gi           61%
ip-10-0-4-44      6080m        38%    27Gi            42%`,
  },
  {
    pattern: /^kubectl\s+top\s+pods/,
    response: `NAME                                        CPU(cores)   MEMORY(bytes)
llm-inference-7f8d9c-x4k2p                  12400m       89Gi
llm-inference-7f8d9c-r9p3v                  11800m       87Gi
model-registry-6b5c4d-m3n1q                 250m         512Mi
whisper-asr-5c7d9e-h3k4m                    4200m        24Gi
model-serving-gateway-8a2b3c-p4q5r          800m         2Gi
training-job-mistral-7b-ft-2                8600m        48Gi
prometheus-server-0                          450m         3Gi
grafana-6f8d9c-t5v2w                        120m         256Mi`,
  },
  {
    pattern: /^kubectl\s+get\s+(ns|namespaces)/,
    response: `NAME              STATUS   AGE
default           Active   30d
kube-system       Active   30d
kube-public       Active   30d
kube-node-lease   Active   30d
ml-serving        Active   14d
monitoring        Active   6d
cert-manager      Active   21d`,
  },
  {
    pattern: /^kubectl\s+config\s+get-contexts/,
    response: `CURRENT   NAME                          CLUSTER                       AUTHINFO                      NAMESPACE
{{green}}*{{reset}}         eks-prod-us-east-1            eks-prod-us-east-1            eks-prod-us-east-1            default
          eks-training-us-west-2        eks-training-us-west-2        eks-training-us-west-2        default
          eks-inference-eu-west-1       eks-inference-eu-west-1       eks-inference-eu-west-1       ml-serving`,
  },
  {
    pattern: /^kubectl\s+get\s+events/,
    response: `LAST SEEN   TYPE      REASON              OBJECT                                   MESSAGE
5m          Normal    Scheduled           pod/llm-inference-7f8d9c-x4k2p          Successfully assigned to ip-10-0-1-42
5m          Normal    Pulled              pod/llm-inference-7f8d9c-x4k2p          Container image already present
5m          Normal    Created             pod/llm-inference-7f8d9c-x4k2p          Created container vllm
5m          Normal    Started             pod/llm-inference-7f8d9c-x4k2p          Started container vllm
12m         {{yellow}}Warning{{reset}}   FailedScheduling    pod/training-job-large-x9m2p             Insufficient nvidia.com/gpu
15m         {{yellow}}Warning{{reset}}   Unhealthy           pod/metrics-collector-3k4m5-w2x1y        Liveness probe failed: 503
1h          Normal    ScalingReplicaSet   deployment/llm-inference                 Scaled up to 4
2h          Normal    Provisioned         node/ip-10-0-2-15                        Karpenter launched g5.12xlarge
3h          {{yellow}}Warning{{reset}}   OOMKilled           pod/data-pipeline-4k2m8-worker-2         OOMKilled (limit: 16Gi)`,
  },
  {
    pattern: /^(help|\?)$/,
    response: `{{cyan}}Kubogent kubectl Console - Supported Commands:{{reset}}

  kubectl get nodes              List cluster nodes
  kubectl get pods               List pods in current namespace
  kubectl get pods -A            List pods in all namespaces
  kubectl get svc                List services
  kubectl get deployments        List deployments
  kubectl get namespaces         List namespaces
  kubectl get events             List recent events
  kubectl describe pod <name>    Describe a pod
  kubectl logs <pod>             View pod logs
  kubectl top nodes              Show node resource usage
  kubectl top pods               Show pod resource usage
  kubectl config get-contexts    List kubectl contexts
  kubectl cluster-info           Display cluster info
  clear                          Clear terminal
  help                           Show this help message`,
  },
]
