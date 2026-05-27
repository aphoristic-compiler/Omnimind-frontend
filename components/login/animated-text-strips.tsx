'use client';

const textContent = [
  'Quantum Mechanics • Generative AI • Neural Networks • RAG Models • Microservices • DevOps • Kubernetes • Cloud Architecture • Machine Learning • Data Science • DSA • Cloud Computing • Political Analysis • Blockchain • Web3 • Distributed Systems',
  'Microchip Processing • IoT • Edge Computing • Parallel Computing • API Design • GraphQL • REST • System Design • Cryptography • Security • Zero Trust • DevSecOps • Cybersecurity • Ethical Hacking • Privacy • Authentication',
  'Natural Language Processing • Computer Vision • Time Series • Forecasting • Analytics • BI Tools • Data Engineering • Deep Learning • Reinforcement Learning • Transformers • GPT • BERT • LLMs • Fine-tuning • Embeddings',
  'Docker • CI/CD • Infrastructure • Terraform • AWS • Azure • GCP • Serverless • Lambda • Microservices • Event Driven • Message Queues • Redis • PostgreSQL • MongoDB • ElasticSearch',
  'React • Next.js • TypeScript • Node.js • Python • FastAPI • Django • Flask • Go • Rust • WebSockets • gRPC • REST APIs • OAuth • JWT • SSO • SAML',
];

const stripConfigs = [
  { top: '8%', duration: 35, direction: 'normal', delay: 0 },
  { top: '28%', duration: 42, direction: 'reverse', delay: 2 },
  { top: '48%', duration: 38, direction: 'normal', delay: 1 },
  { top: '68%', duration: 45, direction: 'reverse', delay: 3 },
  { top: '88%', duration: 40, direction: 'normal', delay: 0.5 },
];

export function AnimatedTextStrips() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
      <style>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        @keyframes scroll-right {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }
      `}</style>

      {/* Left edge fade */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      
      {/* Right edge fade */}
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      {/* Multiple text strips at different positions with varying speeds */}
      {stripConfigs.map((config, stripIndex) => (
        <div
          key={stripIndex}
          className="absolute left-0 right-0 h-12 flex items-center overflow-hidden"
          style={{ top: config.top }}
        >
          <div
            className="flex gap-16 whitespace-nowrap"
            style={{
              animation: `scroll-${config.direction === 'normal' ? 'left' : 'right'} ${config.duration}s linear infinite`,
              animationDelay: `${config.delay}s`,
              willChange: 'transform',
            }}
          >
            {/* Duplicate content for seamless loop */}
            {[0, 1].map((iteration) => (
              <div key={iteration} className="flex gap-16 items-center">
                {textContent[stripIndex].split(' • ').map((word, wordIndex) => (
                  <span
                    key={`${iteration}-${wordIndex}`}
                    className="text-2xl font-semibold tracking-tight flex-shrink-0"
                    style={{
                      color: 'rgba(255, 255, 255, 0.15)',
                      textShadow: '0 0 20px rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    {word}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
