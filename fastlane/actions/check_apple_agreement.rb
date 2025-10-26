require 'fastlane/action'
require 'spaceship'

module Fastlane
  module Actions
    class CheckAppleAgreementAction < Action
      def self.run(params)
        begin
          Spaceship::Portal.login(params[:apple_id], params[:password])
          Spaceship::Portal.client.team_id
          UI.success('No pending Apple Developer agreements. All clear!')
        rescue Spaceship::Client::UnexpectedResponse => e
          if e.message.include?('You have not yet agreed to the latest') || e.message.include?('accept the latest')
            UI.user_error!('Action required: You must accept the latest Apple Developer Program License Agreement.')
          else
            raise
          end
        end
      end

      def self.description
        'Checks if there are any pending Apple Developer agreements that require acceptance.'
      end

      def self.available_options
        [
          FastlaneCore::ConfigItem.new(key: :apple_id,
                                       env_name: 'APPLE_ID',
                                       description: 'Apple ID for login',
                                       optional: false,
                                       type: String),
          FastlaneCore::ConfigItem.new(key: :password,
                                       env_name: 'FASTLANE_PASSWORD',
                                       description: 'App-specific password or Apple ID password',
                                       optional: false,
                                       type: String)
        ]
      end

      def self.authors
        ['GitHub Copilot']
      end
    end
  end
end