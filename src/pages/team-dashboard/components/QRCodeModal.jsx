import React, { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QRCodeModal = ({ isOpen, onClose, team }) => {
  const [qrGenerated, setQrGenerated] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQrGenerated(false);
      const timer = setTimeout(() => {
        setQrGenerated(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownload = () => {
    // Mock download functionality
    const link = document.createElement('a');
    link.href = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    link.download = `${team?.name}-qr-code.png`;
    link?.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative glass rounded-xl p-6 w-full max-w-md neon-border shadow-cyber-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-orbitron font-bold text-foreground">
            Team QR Code
          </h3>
          <Button
            variant="ghost"
            size="xs"
            iconName="X"
            onClick={onClose}
          />
        </div>

        <div className="text-center">
          <div className="mb-6">
            <h4 className="text-lg font-inter font-medium text-foreground mb-2">
              {team?.name}
            </h4>
            <p className="text-sm text-muted-foreground font-jetbrains">
              Team ID: {team?.id}
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 mb-6 mx-auto w-fit">
            {!qrGenerated ? (
              <div className="w-48 h-48 flex items-center justify-center">
                <div className="animate-spin">
                  <Icon name="Loader2" size={32} className="text-primary" />
                </div>
              </div>
            ) : (
              <div className="w-48 h-48 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center relative overflow-hidden">
                {/* Mock QR Code Pattern */}
                <div className="absolute inset-2 grid grid-cols-8 gap-1">
                  {Array.from({ length: 64 })?.map((_, i) => (
                    <div
                      key={i}
                      className={`aspect-square ${
                        Math.random() > 0.5 ? 'bg-background' : 'bg-transparent'
                      } rounded-sm`}
                    ></div>
                  ))}
                </div>
                
                {/* Center Logo */}
                <div className="absolute inset-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                  <Icon name="Zap" size={24} className="text-primary-foreground" />
                </div>
              </div>
            )}
          </div>

          {qrGenerated && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground font-inter">
                Use this QR code for event check-in and verification
              </p>
              
              <div className="flex space-x-3">
                <Button
                  variant="default"
                  iconName="Download"
                  iconPosition="left"
                  onClick={handleDownload}
                  className="flex-1"
                >
                  Download
                </Button>
                <Button
                  variant="outline"
                  iconName="Share"
                  iconPosition="left"
                  className="flex-1"
                >
                  Share
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;